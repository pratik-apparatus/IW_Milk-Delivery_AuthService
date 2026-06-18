import { Controller, Post, Body, Headers } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiHeader } from '@nestjs/swagger';
import { CustomerAuthService } from './customer-auth.service';
import { CustomerLoginDto } from '../dto/customer-login.dto';
import { VerifyOtpDto } from '../dto/verify-otp.dto';

@ApiTags('Customer Authentication')
@Controller('auth/customer')
export class CustomerAuthController {
  constructor(private readonly customerAuthService: CustomerAuthService) {}

  @Post('login')
  @ApiHeader({ name: 'x-tenant-id', required: false })
  @ApiOperation({     summary: 'Customer login  sends OTP and otpSessionToken',

    description: 'If customer with phone number exists,still return otp and otpSessionToken'
  })
  @ApiResponse({
    status: 200,
    description: 'OTP sent successfully for both existing and new customers',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'OTP sent successfully' },
        otpSessionToken: { type: 'string' },
        skipOtp: { type: 'boolean', example: false },
        otp: {
          type: 'string',
          description: 'Only returned in development mode',
        },
      },
    },
  })
  

  @ApiResponse({ status: 400, description: 'Invalid phone number' })
  async requestOtp(
    @Body() dto: CustomerLoginDto,
    @Headers('x-tenant-id') tenantId?: string,
  ) {
    return this.customerAuthService.requestOtp(dto, tenantId);
  }

  @Post('verify-otp')
  @ApiHeader({ name: 'x-tenant-id', required: false })
  @ApiOperation({ summary: 'Verify OTP and get access token' })
  @ApiResponse({ status: 200, description: 'OTP verified, access token returned' })
  @ApiResponse({ status: 401, description: 'Invalid or expired OTP' })
  async verifyOtp(
    @Body() dto: VerifyOtpDto,
    @Headers('x-tenant-id') tenantId?: string,
  ) {
    return this.customerAuthService.verifyOtp(dto, tenantId);
  }
}

