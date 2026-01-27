import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DirectoresObraController } from './directores-obra.controller';
import { DirectoresObraService } from './directores-obra.service';
import { DirectorObra } from './director-obra.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([DirectorObra]), // 🔥 ESTO ES CLAVE
  ],
  controllers: [DirectoresObraController],
  providers: [DirectoresObraService],
})
export class DirectoresObraModule {}
