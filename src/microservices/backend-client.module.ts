import { Global, Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { ClientsModule, Transport } from "@nestjs/microservices";
import { BACKEND_MS_CLIENT } from "./patterns";
import { BackendClientService } from "./backend-client.service";

@Global()
@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: BACKEND_MS_CLIENT,
        imports: [ConfigModule],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.TCP,
          options: {
            host: configService.get<string>("BACKEND_MS_HOST") || "127.0.0.1",
            port: Number(configService.get<string>("BACKEND_MS_PORT") || 4012),
          },
        }),
        inject: [ConfigService],
      },
    ]),
  ],
  providers: [BackendClientService],
  exports: [BackendClientService],
})
export class BackendClientModule {}
