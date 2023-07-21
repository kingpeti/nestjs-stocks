import { NestApplication, NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import swaggerInit from './swagger';

async function bootstrap() {
  const app: NestApplication = await NestFactory.create(AppModule);
  // Swagger
  await swaggerInit(app);
  await app.listen(process.env.PORT || 3000);
}
bootstrap();
