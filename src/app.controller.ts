import { Controller, Get } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { AppService } from "./app.service";

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get("health")
  @ApiTags("Health")
  @ApiOperation({ summary: "Auth service health check" })
  getHealth() {
    return {
      status: "healthy",
      service: "authServices",
      timestamp: new Date().toISOString(),
    };
  }
}
