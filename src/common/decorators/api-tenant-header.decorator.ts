import { applyDecorators } from '@nestjs/common';
import { ApiHeader } from '@nestjs/swagger';

export function ApiTenantHeader(required = false) {
  return applyDecorators(
    ApiHeader({
      name: 'x-tenant-id',
      required,
      description: required
        ? 'Tenant UUID. Required unless DEFAULT_TENANT_ID is configured on the server.'
        : 'Tenant UUID. Optional; falls back to DEFAULT_TENANT_ID when not provided.',
    }),
  );
}
