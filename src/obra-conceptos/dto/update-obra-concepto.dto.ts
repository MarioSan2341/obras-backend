import { IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateObraConceptoDto {
  @IsOptional()
  @IsNumber()
  conceptoId?: number;

  @IsNumber()
  costo_unitario: number;

  @IsNumber()
  cantidad: number;

  @IsOptional()
  @IsString()
  descripcion_costo?: string;
}
