export class ReporteObrasFilterDto {
  page?: number;
  limit?: number;

  fechaInicio?: string;
  fechaFin?: string;

  nombrePropietario?: string;
  consecutivo?: string;

  estadoObra?: string;
  estadoPago?: string;
}
