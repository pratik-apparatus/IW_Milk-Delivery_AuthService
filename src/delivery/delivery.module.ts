import { Module } from "@nestjs/common";
import { DeliveryAuthController } from "./delivery-auth.controller";
import { DeliveryAuthService } from "./delivery-auth.service";
import { CommonAuthModule } from "../common/common-auth.module";

@Module({
  imports: [CommonAuthModule],
  controllers: [DeliveryAuthController],
  providers: [DeliveryAuthService],
})
export class DeliveryModule {}
