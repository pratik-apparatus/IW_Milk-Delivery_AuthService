import { loadedEnvFile } from "./config/load-env";

console.log(
  `Environment: ${process.env.NODE_ENV || "production"} (${loadedEnvFile})`,
);

import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS
  // Enable CORS
  app.enableCors({
    origin: "*",
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS",
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle("Auth Service API")
    .setDescription(
      "Authentication and Authorization Service for Milk Delivery Application",
    )
    .setVersion("1.0")
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api-docs", app, document);

  const port = process.env.PORT || 6024;
  await app.listen(port, "0.0.0.0");
  console.log(`Auth Service is running on: http://localhost:${port}`);
  console.log(`Swagger docs available at: http://localhost:${port}/api-docs`);
}

bootstrap();
