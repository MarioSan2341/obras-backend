import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AreasService } from './areas.service';
import { AreasController } from './areas.controller';
import { Area } from './area.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Area])],
  controllers: [AreasController],
  providers: [AreasService],
  exports: [AreasService], // 🔹 útil si lo usas en otros módulos
})
export class AreasModule {}
