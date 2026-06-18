import { Module } from '@nestjs/common';
import { SmsService } from './sms.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule], // Required to inject ConfigService in SmsService
  providers: [SmsService],
  exports: [SmsService],
})
export class SmsModule {}
