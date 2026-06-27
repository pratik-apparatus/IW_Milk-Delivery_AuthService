import { Controller, Post, Body, Req } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";
import type { Request } from "express";
import { AdminAuthService } from "./admin-auth.service";
import { LoginDto } from "../dto/login.dto";
import { AdminSignupDto } from "src/dto/admin-signup.dto";
import { ApiTenantHeader } from "../common/decorators/api-tenant-header.decorator";
import { getTenantIdFromRequest } from "../common/utils/tenant-id.util";

@ApiTags("Admin Authentication")
@Controller("auth/admin")
export class AdminAuthController {
  constructor(private readonly adminAuthService: AdminAuthService) {}

  @Post("login")
  @ApiOperation({
    summary:
      "Admin login with email/password (tenant resolved from email automatically)",
  })
  @ApiResponse({ status: 200, description: "Login successful" })
  @ApiResponse({ status: 401, description: "Invalid credentials" })
  async login(@Body() dto: LoginDto) {
    return this.adminAuthService.login(dto);
  }

  @Post("signup")
  @ApiTenantHeader(false)
  @ApiOperation({ summary: "Admin signup" })
  @ApiResponse({ status: 200, description: "Signup successful" })
  async signup(@Body() dto: AdminSignupDto, @Req() req: Request) {
    return this.adminAuthService.signup(dto, getTenantIdFromRequest(req));
  }
}
