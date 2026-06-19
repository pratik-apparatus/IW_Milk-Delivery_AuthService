import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom, timeout } from 'rxjs';
import { BACKEND_MS_CLIENT, BackendPatterns } from './patterns';
import { RpcEnvelope } from './rpc.types';

@Injectable()
export class BackendClientService {
  private readonly internalToken: string;
  private readonly defaultTenantId: string;

  constructor(
    @Inject(BACKEND_MS_CLIENT) private readonly backendClient: ClientProxy,
    private readonly configService: ConfigService,
  ) {
    this.internalToken =
      this.configService.get<string>('INTERNAL_SERVICE_TOKEN') || '';
    this.defaultTenantId =
      this.configService.get<string>('DEFAULT_TENANT_ID') || '';
  }

  private async send<T>(
    pattern: object,
    data: unknown,
    tenantId?: string | null,
    options?: { allowMissingTenant?: boolean },
  ): Promise<T> {
    const envelope: RpcEnvelope = {
      token: this.internalToken,
      tenantId:
        options?.allowMissingTenant && !tenantId
          ? undefined
          : tenantId || this.defaultTenantId || undefined,
      data,
    };

    return firstValueFrom(
      this.backendClient.send<T>(pattern, envelope).pipe(timeout(10000)),
    );
  }

  getRpcStatus(error: unknown): number | undefined {
    if (!error || typeof error !== 'object') {
      return undefined;
    }
    const record = error as Record<string, unknown>;
    if (typeof record.status === 'number') {
      return record.status;
    }
    if (typeof record.statusCode === 'number') {
      return record.statusCode;
    }

    const message = String(record.message || '').toLowerCase();
    if (
      message.includes('invalid credentials') ||
      message.includes('unauthorized') ||
      message.includes('password not set') ||
      message.includes('admin user not found')
    ) {
      return 401;
    }

    if (record.status === 'error' && message) {
      return 401;
    }

    return undefined;
  }

  getAdminLoginData(identifier: string) {
    return this.send(
      BackendPatterns.AUTH_GET_ADMIN_LOGIN_DATA,
      { identifier },
      null,
      { allowMissingTenant: true },
    );
  }

  getLoginData(identifier: string, role: string, tenantId?: string | null) {
    return this.send(
      BackendPatterns.AUTH_GET_LOGIN_DATA,
      { identifier, role },
      tenantId,
      { allowMissingTenant: true },
    );
  }

  validateEmail(email: string, role?: string, tenantId?: string | null) {
    return this.send(
      BackendPatterns.AUTH_VALIDATE_EMAIL,
      { email, role },
      tenantId,
      { allowMissingTenant: true },
    );
  }

  updatePassword(email: string, newPassword: string, tenantId?: string | null) {
    return this.send(
      BackendPatterns.AUTH_UPDATE_PASSWORD,
      { email, newPassword },
      tenantId,
      { allowMissingTenant: true },
    );
  }

  issueRefreshToken(input: {
    userId: string;
    role: string;
    tenantId?: string | null;
  }) {
    return this.send(
      BackendPatterns.AUTH_ISSUE_REFRESH_TOKEN,
      input,
      input.tenantId,
      { allowMissingTenant: true },
    );
  }

  rotateRefreshToken(refreshToken: string, tenantId?: string | null) {
    return this.send(
      BackendPatterns.AUTH_ROTATE_REFRESH_TOKEN,
      { refreshToken },
      tenantId,
      { allowMissingTenant: true },
    );
  }

  findOrCreateCustomer(phone: string, tenantId?: string | null) {
    return this.send(
      BackendPatterns.CUSTOMER_FIND_OR_CREATE,
      { phone },
      tenantId,
    );
  }

  getCustomerAuthData(phone: string, tenantId?: string | null) {
    return this.send(
      BackendPatterns.CUSTOMER_GET_AUTH_DATA,
      { phone },
      tenantId,
    );
  }

  createAdmin(payload: {
    username: string;
    email: string;
    password: string;
    phone: string;
    role: string;
    tenantId?: string | null;
  }) {
    return this.send(
      BackendPatterns.ADMIN_CREATE,
      payload,
      payload.tenantId,
      { allowMissingTenant: true },
    );
  }
}
