import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsEmail, IsEnum, IsOptional } from 'class-validator';

export enum UserRole {
  ADMIN = 'ADMIN',
  DELIVERY_PARTNER = 'DELIVERY_PARTNER',
  SUPER_ADMIN = 'SUPER_ADMIN',
}

export class ForgotPasswordDto {
  @ApiProperty({ example: 'pratik.p@apparatus.solutions', description: 'User email' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ 
    example: 'ADMIN', 
    description: 'User role (ADMIN or DELIVERY_PARTNER). Required when requesting from admin panel.',
    enum: UserRole,
    required: false 
  })
  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole;
}

