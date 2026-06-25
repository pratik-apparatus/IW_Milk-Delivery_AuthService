import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from "@nestjs/common";
import axios from "axios";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);

  constructor(private readonly configService: ConfigService) {}

  private get authKey() {
    return this.configService.get<string>("MSG91_AUTH_KEY")?.trim();
  }

  private get templateId() {
    return this.configService.get<string>("MSG91_OTP_TEMPLATE_ID")?.trim();
  }

  private get templateMap() {
    const raw = this.configService.get<string>("MSG91_TEMPLATES_JSON");
    if (!raw) {
      return {} as Record<string, string>;
    }
    try {
      return JSON.parse(raw) as Record<string, string>;
    } catch {
      return {};
    }
  }

  isConfigured(): boolean {
    return Boolean(
      this.authKey &&
      (this.templateId || Object.keys(this.templateMap).length > 0),
    );
  }

  async sendOtp(
    phone: string,
    otp: string,
    templateKey: string = "otp_login",
  ): Promise<{ sent: boolean }> {
    const authKey = this.authKey;
    const templateId = this.templateMap[templateKey] || this.templateId;

    if (!authKey || !templateId) {
      this.logger.warn(
        "SMS provider not configured — skipping send; OTP is returned in the API response for testing",
      );
      return { sent: false };
    }

    try {
      // Keep only digits and prepend 91 for India if only 10 digits
      let formattedPhone = phone.replace(/\D/g, "");
      if (formattedPhone.length === 10) {
        formattedPhone = "91" + formattedPhone;
      }

      this.logger.log(`Attempting to send OTP via MSG91 to ${formattedPhone}`);

      // MSG91 v5 OTP POST API
      const response = await axios.get("https://control.msg91.com/api/v5/otp", {
        params: {
          template_id: templateId,
          mobile: formattedPhone,
          otp: otp,
        },
        headers: {
          authkey: authKey,
          accept: "application/json",
        },
      });

      const data = response.data;
      if (
        data.type === "error" ||
        data.status === "fail" ||
        data.message === "Unauthorized"
      ) {
        this.logger.error(`MSG91 Error: ${JSON.stringify(data)}`);
        throw new InternalServerErrorException(
          "MSG91 API Error: " + (data.message || "Unauthorized"),
        );
      }

      this.logger.log(`OTP sent successfully via MSG91 to ${formattedPhone}`);
      return { sent: true };
    } catch (error) {
      const errorData = error.response?.data || error.message;
      this.logger.error("MSG91 connection error:", JSON.stringify(errorData));
      throw new InternalServerErrorException("SMS Service Unavailable");
    }
  }
}
