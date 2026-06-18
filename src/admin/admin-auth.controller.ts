import { Controller, Post, Body, Headers } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiHeader } from '@nestjs/swagger';
import { AdminAuthService } from './admin-auth.service';
import { LoginDto } from '../dto/login.dto';
import { AdminSignupDto } from 'src/dto/admin-signup.dto';

@ApiTags('Admin Authentication')
@Controller('auth/admin')
export class AdminAuthController {
  constructor(private readonly adminAuthService: AdminAuthService) {}

  @Post('login')
  @ApiOperation({
    summary: 'Admin login with email/password (tenant resolved from email automatically)',
  })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body() dto: LoginDto) {
    return this.adminAuthService.login(dto);
  }

  @Post('signup')
  @ApiHeader({ name: 'x-tenant-id', required: false })
  @ApiOperation({ summary: 'Admin signup' })
  @ApiResponse({ status: 200, description: 'Signup successful' })
  async signup(
    @Body() dto: AdminSignupDto,
    @Headers('x-tenant-id') tenantId?: string,
  ) {
    return this.adminAuthService.signup(dto, tenantId);
  }
}
