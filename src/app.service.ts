import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    console.log("Authservice health check invoked");
    return 'Authservice  is alive 🌱';
  }
}
