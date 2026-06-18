import { Injectable } from '@nestjs/common';
import { JwtService } from '../jwt/jwt.service';
import { BackendClientService } from '../microservices/backend-client.service';

@Injectable()
export class TokenIssuerService {
  private readonly defaultTenantId = process.env.DEFAULT_TENANT_ID || '';

  constructor(
    private readonly jwtService: JwtService,
    private readonly backendClient: BackendClientService,
  ) {}

  async issueTokens(input: {
    userId: string;
    role: string;
    tenantId?: string | null;
    identifier?: string;
  }) {
    const tenantId = input.tenantId ?? null;
    const accessToken = this.jwtService.generateAccessToken({
      sub: input.userId,
      role: input.role,
      tenantId,
    });

    const refreshResponse = (await this.backendClient.issueRefreshToken({
      userId: input.userId,
      role: input.role,
      tenantId,
    })) as { refreshToken: string; expiresAt: string };

    return {
      accessToken,
      refreshToken: refreshResponse.refreshToken,
      refreshTokenExpiresAt: refreshResponse.expiresAt,
      role: input.role,
      tenantId,
      user: {
        id: input.userId,
        identifier: input.identifier,
      },
    };
  }

  async refreshAccessToken(refreshToken: string) {
    const rotated = (await this.backendClient.rotateRefreshToken(
      refreshToken,
      this.defaultTenantId,
    )) as { userId: string; role: string; tenantId?: string | null };

    const { userId, role, tenantId } = rotated;
    return this.issueTokens({
      userId,
      role,
      tenantId,
    });
  }
}
