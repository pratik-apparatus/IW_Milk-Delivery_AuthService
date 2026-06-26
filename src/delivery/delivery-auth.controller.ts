import { Controller, Post, Body, Headers } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { DeliveryAuthService } from "./delivery-auth.service";
import { LoginDto } from "../dto/login.dto";
import { ApiTenantHeader } from "../common/decorators/api-tenant-header.decorator";

@ApiTags("Delivery Partner Authentication")
@ApiTenantHeader(false)
@Controller("auth/delivery")
export class DeliveryAuthController {
  constructor(private readonly deliveryAuthService: DeliveryAuthService) {}

  @Post("login")
  @ApiOperation({ summary: "Delivery partner login with username/password" })
  @ApiResponse({ status: 200, description: "Login successful" })
  @ApiResponse({ status: 401, description: "Invalid credentials" })
  async login(
    @Body() dto: LoginDto,
    @Headers("x-tenant-id") tenantId?: string,
  ) {
    return this.deliveryAuthService.login(dto, tenantId);
  }
}
