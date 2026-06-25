import { Controller, Post, Body, Headers } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiHeader } from "@nestjs/swagger";
import { DeliveryAuthService } from "./delivery-auth.service";
import { LoginDto } from "../dto/login.dto";

@ApiTags("Delivery Partner Authentication")
@Controller("auth/delivery")
export class DeliveryAuthController {
  constructor(private readonly deliveryAuthService: DeliveryAuthService) {}

  @Post("login")
  @ApiHeader({ name: "x-tenant-id", required: false })
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
