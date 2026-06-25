import { Module } from "@nestjs/common";
import { SmsModule } from "../sms/sms.module";
import { RefreshAuthController } from "./refresh-auth.controller";
import { CommonAuthModule } from "../common/common-auth.module";

@Module({
  imports: [SmsModule, CommonAuthModule],
  controllers: [RefreshAuthController],
})
export class AuthModule {}
