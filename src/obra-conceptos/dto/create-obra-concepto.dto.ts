// src/obra-conceptos/dto/create-obra-concepto.dto.ts
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateObraConceptoDto {
  @IsNumber()
obraId: number;

  @IsNumber()
conceptoId: number;

  @IsOptional()
  @IsString()
  descripcion_costo?: string;

  @IsOptional()
  @IsString()
  medicion?: string;

  @IsNumber()
  costo_unitario: number;

  @IsNumber()
  cantidad: number;
}
