import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Habilitar CORS si necesitas frontend
  app.enableCors();

  // Escucha el puerto 3001 (o el que tengas en env)
  await app.listen(process.env.PORT ?? 3001);

  console.log(`Servidor corriendo en http://localhost:${process.env.PORT ?? 3001}`);
}

bootstrap();
