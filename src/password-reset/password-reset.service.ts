import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '../jwt/jwt.service';
import { ForgotPasswordDto } from '../dto/forgot-password.dto';
import { ResetPasswordDto } from '../dto/reset-password.dto';
import { BackendClientService } from '../microservices/backend-client.service';
import { MailClientService } from '../microservices/mail-client.service';

@Injectable()
export class PasswordResetService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly backendClient: BackendClientService,
    private readonly mailClient: MailClientService,
  ) {}

  async forgotPassword(dto: ForgotPasswordDto) {
    const email = dto.email.trim().toLowerCase();
    const { role } = dto;

    try {
      await this.backendClient.validateEmail(email, role);
    } catch {
      return {
        message: 'If the email exists, a password reset link has been sent',
      };
    }

    const resetToken = this.jwtService.generateResetToken({
      sub: email,
      email,
    });

    try {
      await this.mailClient.sendPasswordReset({
        to: email,
        resetToken,
        frontendUrl: process.env.FRONTEND_URL,
      });
    } catch (error) {
      console.error('Failed to send password reset email:', error);
    }

    return {
      message: 'If the email exists, a password reset link has been sent',
    };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const { token, newPassword } = dto;

    let resetPayload;
    try {
      resetPayload = this.jwtService.verifyResetToken(token);
    } catch {
      throw new UnauthorizedException('Invalid or expired reset token');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    try {
      await this.backendClient.updatePassword(
        resetPayload.email,
        hashedPassword,
      );
    } catch {
      throw new BadRequestException('Failed to update password');
    }

    return {
      message: 'Password reset successfully',
    };
  }
}
