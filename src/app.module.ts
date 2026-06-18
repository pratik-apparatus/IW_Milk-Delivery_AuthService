import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { CustomerModule } from './customer/customer.module';
import { AdminModule } from './admin/admin.module';
import { DeliveryModule } from './delivery/delivery.module';
import { PasswordResetModule } from './password-reset/password-reset.module';
import { JwtModule } from './jwt/jwt.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BackendClientModule } from './microservices/backend-client.module';
import { MailClientModule } from './microservices/mail-client.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    BackendClientModule,
    MailClientModule,
    AuthModule,
    CustomerModule,
    AdminModule,
    DeliveryModule,
    PasswordResetModule,
    JwtModule,
  ],
  controllers: [AppController],
  providers: [AppService], // AppService is used by AppController
})
export class AppModule { }

