import { Injectable, UnauthorizedException } from "@nestjs/common";
import * as bcrypt from "bcrypt";
import { LoginDto } from "../dto/login.dto";
import { TokenIssuerService } from "../common/token-issuer.service";
import { BackendClientService } from "../microservices/backend-client.service";

@Injectable()
export class DeliveryAuthService {
  private readonly defaultTenantId = process.env.DEFAULT_TENANT_ID || "";

  constructor(
    private readonly tokenIssuerService: TokenIssuerService,
    private readonly backendClient: BackendClientService,
  ) {}

  private resolveTenantId(tenantIdHeader?: string) {
    return (tenantIdHeader || this.defaultTenantId || "").trim() || null;
  }

  async login(dto: LoginDto, tenantIdHeader?: string) {
    const { email, password } = dto;
    const tenantId = this.resolveTenantId(tenantIdHeader);

    let loginData: any;
    try {
      loginData = await this.backendClient.getLoginData(
        email,
        "DELIVERY_PARTNER",
        tenantId || this.defaultTenantId,
      );
    } catch {
      throw new UnauthorizedException("Invalid credentials");
    }

    const isPasswordValid = await bcrypt.compare(password, loginData.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException("Invalid credentials");
    }

    if (loginData.role !== "DELIVERY_PARTNER") {
      throw new UnauthorizedException("Access denied");
    }

    const tokens = await this.tokenIssuerService.issueTokens({
      userId: loginData.userId,
      role: "DELIVERY_PARTNER",
      tenantId: loginData.tenantId || tenantId,
      identifier: loginData.identifier,
    });

    return {
      message: "Login successful",
      ...tokens,
    };
  }
}
