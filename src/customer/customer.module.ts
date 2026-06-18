import { Module } from '@nestjs/common';
import { CustomerAuthController } from './customer-auth.controller';
import { CustomerAuthService } from './customer-auth.service';
import { JwtModule } from '../jwt/jwt.module';
import { SmsModule } from '../sms/sms.module';
import { CommonAuthModule } from '../common/common-auth.module';

@Module({
  imports: [JwtModule, SmsModule, CommonAuthModule],
  controllers: [CustomerAuthController],
  providers: [CustomerAuthService],
})
export class CustomerModule {}

