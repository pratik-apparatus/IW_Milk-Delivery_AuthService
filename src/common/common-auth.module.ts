import { Module } from '@nestjs/common';
import { JwtModule } from '../jwt/jwt.module';
import { TokenIssuerService } from './token-issuer.service';

@Module({
  imports: [JwtModule],
  providers: [TokenIssuerService],
  exports: [TokenIssuerService],
})
export class CommonAuthModule {}
