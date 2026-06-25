import { Inject, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { ClientProxy } from "@nestjs/microservices";
import { firstValueFrom, timeout } from "rxjs";
import { MAIL_MS_CLIENT, MailPatterns } from "./patterns";
import { RpcEnvelope } from "./rpc.types";

@Injectable()
export class MailClientService {
  private readonly internalToken: string;

  constructor(
    @Inject(MAIL_MS_CLIENT) private readonly mailClient: ClientProxy,
    private readonly configService: ConfigService,
  ) {
    this.internalToken =
      this.configService.get<string>("INTERNAL_SERVICE_TOKEN") || "";
  }

  private async send<T>(pattern: object, data: unknown): Promise<T> {
    const envelope: RpcEnvelope = {
      token: this.internalToken,
      data,
    };

    return firstValueFrom(
      this.mailClient.send<T>(pattern, envelope).pipe(timeout(10000)),
    );
  }

  sendPasswordReset(payload: {
    to: string;
    resetToken: string;
    frontendUrl?: string;
  }) {
    return this.send(MailPatterns.SEND_PASSWORD_RESET, payload);
  }
}
