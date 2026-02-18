import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.enableCors();

  // Carpeta uploads en la raíz del proyecto (donde ejecutas npm run start)
  const uploadsDir = join(process.cwd(), 'uploads');
  app.useStaticAssets(uploadsDir, {
    prefix: '/uploads/',
  });

  await app.listen(3001);
  console.log('Servidor corriendo en http://localhost:3001');
  console.log('Imágenes de directores en:', join(uploadsDir, 'directores'));
}
bootstrap();