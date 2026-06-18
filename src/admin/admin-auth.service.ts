import { BadRequestException, Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { LoginDto } from '../dto/login.dto';
import { AdminRole, AdminSignupDto } from 'src/dto/admin-signup.dto';
import { TokenIssuerService } from '../common/token-issuer.service';
import { BackendClientService } from '../microservices/backend-client.service';

@Injectable()
export class AdminAuthService {
  private readonly logger = new Logger(AdminAuthService.name);

  constructor(
    private readonly tokenIssuerService: TokenIssuerService,
    private readonly backendClient: BackendClientService,
  ) {}

  async signup(dto: AdminSignupDto, tenantIdHeader?: string) {
    const { username, email, password, phone, role } = dto;
    const tenantId = tenantIdHeader?.trim() || null;
    const hashedPassword = await bcrypt.hash(password, 10);

    try {
      const response = await this.backendClient.createAdmin({
        username,
        email,
        password: hashedPassword,
        phone,
        role: role || AdminRole.ADMIN,
        tenantId,
      }) as { id: string };

      return {
        message: 'Admin created successfully',
        adminId: response.id,
      };
    } catch (error: any) {
      throw new BadRequestException(error?.message || 'Admin creation failed');
    }
  }

  async login(dto: LoginDto) {
    const { email, password } = dto;
    this.logger.log(`Admin login attempt for: ${email}`);

    let loginData: {
      userId: string;
      identifier: string;
      password: string;
      role: AdminRole;
      tenantId: string | null;
      tenant: Record<string, unknown> | null;
    };

    try {
      loginData = (await this.backendClient.getAdminLoginData(email)) as typeof loginData;
    } catch (error: any) {
      if (this.backendClient.getRpcStatus(error) === 401) {
        throw new UnauthorizedException('Invalid credentials');
      }
      throw new UnauthorizedException('Login failed - Backend unavailable?');
    }

    const isPasswordValid = await bcrypt.compare(password, loginData.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (![AdminRole.ADMIN, AdminRole.SUPER_ADMIN].includes(loginData.role)) {
      throw new UnauthorizedException('Access denied');
    }

    const tokenTenantId =
      loginData.role === AdminRole.SUPER_ADMIN ? null : loginData.tenantId;

    const tokens = await this.tokenIssuerService.issueTokens({
      userId: loginData.userId,
      role: loginData.role,
      tenantId: tokenTenantId,
      identifier: loginData.identifier,
    });

    return {
      message: 'Login successful',
      ...tokens,
      tenant: loginData.tenant,
    };
  }
}
