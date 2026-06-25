import { Module } from "@nestjs/common";
import { AdminAuthController } from "./admin-auth.controller";
import { AdminAuthService } from "./admin-auth.service";
import { CommonAuthModule } from "../common/common-auth.module";

@Module({
  imports: [CommonAuthModule],
  controllers: [AdminAuthController],
  providers: [AdminAuthService],
})
export class AdminModule {}
