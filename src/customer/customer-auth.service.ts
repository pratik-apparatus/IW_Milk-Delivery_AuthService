import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
} from "@nestjs/common";
import * as bcrypt from "bcrypt";
import { JwtService } from "../jwt/jwt.service";
import { CustomerLoginDto } from "../dto/customer-login.dto";
import { VerifyOtpDto } from "../dto/verify-otp.dto";
import { SmsService } from "../sms/sms.service";
import { TokenIssuerService } from "../common/token-issuer.service";
import { BackendClientService } from "../microservices/backend-client.service";

@Injectable()
export class CustomerAuthService {
  private readonly defaultTenantId = process.env.DEFAULT_TENANT_ID || "";

  constructor(
    private readonly jwtService: JwtService,
    private readonly smsService: SmsService,
    private readonly tokenIssuerService: TokenIssuerService,
    private readonly backendClient: BackendClientService,
  ) {}

  private resolveTenantId(tenantIdHeader?: string) {
    return (tenantIdHeader || this.defaultTenantId || "").trim() || null;
  }

  private requireTenantId(tenantIdHeader?: string) {
    const tenantId = this.resolveTenantId(tenantIdHeader);
    if (!tenantId) {
      throw new BadRequestException(
        "Tenant context is required. Pass the x-tenant-id header.",
      );
    }
    return tenantId;
  }

  private shouldExposeOtpInResponse(smsSent: boolean): boolean {
    if (process.env.EXPOSE_OTP_IN_RESPONSE === "true") {
      return true;
    }

    return !smsSent || process.env.NODE_ENV === "development";
  }

  async requestOtp(dto: CustomerLoginDto, tenantIdHeader?: string) {
    const { phone } = dto;
    const tenantId = this.requireTenantId(tenantIdHeader);

    let customerResult: { isNewCustomer?: boolean };
    try {
      customerResult = await this.backendClient.findOrCreateCustomer(
        phone,
        tenantId,
      );
    } catch {
      throw new BadRequestException("Failed to process customer request");
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpHash = await bcrypt.hash(otp, 10);
    const otpSessionToken = this.jwtService.generateOtpSessionToken(
      phone,
      otpHash,
      tenantId,
    );

    let smsSent = false;
    try {
      const result = await this.smsService.sendOtp(phone, otp, "otp_login");
      smsSent = result.sent;
    } catch {
      smsSent = false;
    }

    const exposeOtp = this.shouldExposeOtpInResponse(smsSent);

    return {
      message: "OTP sent successfully",
      otpSessionToken,
      skipOtp: false,
      isNewCustomer: customerResult.isNewCustomer ?? false,
      ...(exposeOtp && { otp }),
    };
  }

  async verifyOtp(dto: VerifyOtpDto, tenantIdHeader?: string) {
    const { otp, otpSessionToken } = dto;

    let otpSessionPayload;
    try {
      otpSessionPayload =
        this.jwtService.verifyOtpSessionToken(otpSessionToken);
    } catch {
      throw new UnauthorizedException("Invalid or expired OTP session token");
    }

    const { phone, otpHash, tenantId: sessionTenantId } = otpSessionPayload;
    const headerTenantId = this.resolveTenantId(tenantIdHeader);

    if (
      sessionTenantId &&
      headerTenantId &&
      sessionTenantId !== headerTenantId
    ) {
      throw new BadRequestException(
        "x-tenant-id does not match the tenant used when OTP was sent",
      );
    }

    const tenantId = sessionTenantId || headerTenantId;
    if (!tenantId) {
      throw new BadRequestException(
        "Tenant context is required. Pass the x-tenant-id header.",
      );
    }

    const isOtpValid = await bcrypt.compare(otp, otpHash);
    if (!isOtpValid) {
      throw new UnauthorizedException("Invalid OTP");
    }

    let authData: any;
    try {
      authData = await this.backendClient.getCustomerAuthData(phone, tenantId);
    } catch {
      throw new BadRequestException("Failed to retrieve customer data");
    }

    const tokens = await this.tokenIssuerService.issueTokens({
      userId: authData.customerId,
      role: "CUSTOMER",
      tenantId: authData.tenantId || tenantId,
      identifier: authData.phone,
    });

    return {
      message: "Login successful",
      ...tokens,
      user: {
        id: authData.customerId,
        phone: authData.phone,
      },
    };
  }
}
