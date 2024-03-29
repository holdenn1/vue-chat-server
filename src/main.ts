import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';

import './firebase'

const PORT = process.env.PORT || 5000;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());
  app.enableCors({
    credentials: true,
    origin: process.env.DOMAIN,
    // origin: 'http://localhost:5173',
  });
  await app.listen(PORT, () => console.log(`server was started on ${PORT} port`));
}

bootstrap();
