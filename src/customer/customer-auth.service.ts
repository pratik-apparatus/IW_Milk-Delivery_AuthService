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

  async requestOtp(dto: CustomerLoginDto, tenantIdHeader?: string) {
    const { phone } = dto;
    const tenantId = this.resolveTenantId(tenantIdHeader);

    let customerResult: { isNewCustomer?: boolean };
    try {
      customerResult = await this.backendClient.findOrCreateCustomer(
        phone,
        tenantId || this.defaultTenantId,
      );
    } catch {
      throw new BadRequestException("Failed to process customer request");
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpHash = await bcrypt.hash(otp, 10);
    const otpSessionToken = this.jwtService.generateOtpSessionToken(
      phone,
      otpHash,
    );
    const { sent: smsSent } = await this.smsService.sendOtp(
      phone,
      otp,
      "otp_login",
    );

    const exposeOtp = !smsSent || process.env.NODE_ENV === "development";

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
    const tenantId = this.resolveTenantId(tenantIdHeader);

    let otpSessionPayload;
    try {
      otpSessionPayload =
        this.jwtService.verifyOtpSessionToken(otpSessionToken);
    } catch {
      throw new UnauthorizedException("Invalid or expired OTP session token");
    }

    const { phone, otpHash } = otpSessionPayload;
    const isOtpValid = await bcrypt.compare(otp, otpHash);
    if (!isOtpValid) {
      throw new UnauthorizedException("Invalid OTP");
    }

    let authData: any;
    try {
      authData = await this.backendClient.getCustomerAuthData(
        phone,
        tenantId || this.defaultTenantId,
      );
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
