import { Body, Controller, Post } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";
import { TokenIssuerService } from "../common/token-issuer.service";

class RefreshTokenDto {
  @IsString()
  @IsNotEmpty()
  refreshToken: string;
}

@ApiTags("Authentication")
@Controller("auth")
export class RefreshAuthController {
  constructor(private readonly tokenIssuerService: TokenIssuerService) {}

  @Post("refresh")
  @ApiOperation({ summary: "Refresh access token using refresh token" })
  async refresh(@Body() dto: RefreshTokenDto) {
    const tokens = await this.tokenIssuerService.refreshAccessToken(
      dto.refreshToken,
    );
    return {
      message: "Token refreshed successfully",
      ...tokens,
    };
  }
}
