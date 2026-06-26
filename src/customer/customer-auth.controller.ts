import { Controller, Post, Body, Headers } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { CustomerAuthService } from "./customer-auth.service";
import { CustomerLoginDto } from "../dto/customer-login.dto";
import { VerifyOtpDto } from "../dto/verify-otp.dto";
import { ApiTenantHeader } from "../common/decorators/api-tenant-header.decorator";

@ApiTags("Customer Authentication")
@ApiTenantHeader(false)
@Controller("auth/customer")
export class CustomerAuthController {
  constructor(private readonly customerAuthService: CustomerAuthService) {}

  @Post("login")
  @ApiOperation({
    summary: "Customer sign-in — sends OTP and otpSessionToken",
    description:
      "Existing customers receive an OTP. When SMS is not configured, otp is included in the response for frontend testing.",
  })
  @ApiResponse({
    status: 200,
    description: "OTP sent successfully",
    schema: {
      type: "object",
      properties: {
        message: { type: "string", example: "OTP sent successfully" },
        otpSessionToken: { type: "string" },
        skipOtp: { type: "boolean", example: false },
        isNewCustomer: { type: "boolean", example: false },
        otp: {
          type: "string",
          description:
            "Returned when SMS provider is not configured, or in development mode",
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: "Invalid phone number" })
  async login(
    @Body() dto: CustomerLoginDto,
    @Headers("x-tenant-id") tenantId?: string,
  ) {
    return this.customerAuthService.requestOtp(dto, tenantId);
  }

  @Post("signup")
  @ApiOperation({
    summary: "Customer sign-up — sends OTP and otpSessionToken",
    description:
      "Creates a guest customer if the phone is new, then sends OTP. Same response shape as login.",
  })
  @ApiResponse({
    status: 200,
    description: "OTP sent successfully",
    schema: {
      type: "object",
      properties: {
        message: { type: "string", example: "OTP sent successfully" },
        otpSessionToken: { type: "string" },
        skipOtp: { type: "boolean", example: false },
        isNewCustomer: { type: "boolean", example: true },
        otp: {
          type: "string",
          description:
            "Returned when EXPOSE_OTP_IN_RESPONSE=true, SMS is not configured, or in development mode",
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: "Invalid phone number" })
  async signup(
    @Body() dto: CustomerLoginDto,
    @Headers("x-tenant-id") tenantId?: string,
  ) {
    return this.customerAuthService.requestOtp(dto, tenantId);
  }

  @Post("resend-otp")
  @ApiOperation({
    summary: "Resend OTP for sign-up or sign-in",
    description:
      "Issues a new OTP and otpSessionToken for the same phone number.",
  })
  @ApiResponse({ status: 200, description: "OTP resent successfully" })
  @ApiResponse({ status: 400, description: "Invalid phone number" })
  async resendOtp(
    @Body() dto: CustomerLoginDto,
    @Headers("x-tenant-id") tenantId?: string,
  ) {
    return this.customerAuthService.requestOtp(dto, tenantId);
  }

  @Post("verify-otp")
  @ApiOperation({ summary: "Verify OTP and get access token" })
  @ApiResponse({
    status: 200,
    description: "OTP verified, access token returned",
  })
  @ApiResponse({ status: 401, description: "Invalid or expired OTP" })
  async verifyOtp(
    @Body() dto: VerifyOtpDto,
    @Headers("x-tenant-id") tenantId?: string,
  ) {
    return this.customerAuthService.verifyOtp(dto, tenantId);
  }
}
