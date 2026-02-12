export class ReporteLicenciasFilterDto {
  page?: number;
  limit?: number;

  fechaInicio?: string;
  fechaFin?: string;

  consecutivo?: string;
  nombreConcepto?: string;
  tipoLicencia?: string;
  clasificacion?: string;
}
