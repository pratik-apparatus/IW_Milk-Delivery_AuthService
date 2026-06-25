import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsNotEmpty, Matches } from "class-validator";

export class CustomerLoginDto {
  @ApiProperty({ example: "+1234567890", description: "Phone number" })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\+?[1-9]\d{1,14}$/, { message: "Invalid phone number format" })
  phone: string;
}
