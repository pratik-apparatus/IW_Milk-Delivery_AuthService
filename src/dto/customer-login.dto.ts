import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsNotEmpty, Matches } from "class-validator";

export class CustomerLoginDto {
  // only indian numbers
  @ApiProperty({ example: "+919876543210", description: "Phone number" })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\+?[1-9]\d{1,14}$/, { message: "Invalid phone number format" })
  @Matches(/^(\+91)?[6-9]\d{9}$/, { message: "Invalid  phone number" })
  phone: string;
}
