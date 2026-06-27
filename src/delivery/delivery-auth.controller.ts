import { Controller, Post, Body, Req } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";
import type { Request } from "express";
import { DeliveryAuthService } from "./delivery-auth.service";
import { LoginDto } from "../dto/login.dto";
import { ApiTenantHeader } from "../common/decorators/api-tenant-header.decorator";
import { getTenantIdFromRequest } from "../common/utils/tenant-id.util";

@ApiTags("Delivery Partner Authentication")
@ApiTenantHeader(true)
@Controller("auth/delivery")
export class DeliveryAuthController {
  constructor(private readonly deliveryAuthService: DeliveryAuthService) {}

  @Post("login")
  @ApiOperation({ summary: "Delivery partner login with username/password" })
  @ApiResponse({ status: 200, description: "Login successful" })
  @ApiResponse({ status: 401, description: "Invalid credentials" })
  async login(@Body() dto: LoginDto, @Req() req: Request) {
    return this.deliveryAuthService.login(dto, getTenantIdFromRequest(req));
  }
}
