export class CreateConceptoDto {
  nombre: string;
  observaciones?: string;
  medicion?: string;
  costo?: number;
  porcentaje?: number;
  estado?: boolean;
  parent_id?: number;
}
