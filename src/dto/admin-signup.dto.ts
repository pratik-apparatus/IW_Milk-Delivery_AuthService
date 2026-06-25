import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export enum AdminRole {
  ADMIN = "ADMIN",
  SUPER_ADMIN = "SUPER_ADMIN",
}

export class AdminSignupDto {
  @ApiProperty({ example: "username", description: "username" })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({ example: "user@gmail.com", description: "admin email" })
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({ example: "pass123", description: "admin password" })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @ApiProperty({ example: "+1234567890", description: "Phone number" })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiProperty({ example: "SUPER_ADMIN", enum: AdminRole, required: false })
  @IsOptional()
  @IsEnum(AdminRole)
  role?: AdminRole;
}
