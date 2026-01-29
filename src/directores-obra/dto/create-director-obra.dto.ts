export class CreateDirectorObraDto {
  clave_director?: string;
  nombre_completo: string;
  domicilio: string;
  colonia: string;
  municipio: string;
  codigo_postal?: string;
  telefono?: string;
  rfc: string;
  cedula_federal?: string;
  cedula_estatal?: string;

  oficio_autorizacion_ro?: string;
  oficio_autorizacion_rp?: string;
  oficio_autorizacion_pu?: string;

  ro_edificacion?: any;
  ro_restauracion?: any;
  ro_urbanizacion?: any;
  ro_infraestructura?: any;

  rp_edificacion?: any;
  rp_restauracion?: any;
  rp_urbanizacion?: any;
  rp_infraestructura?: any;

  activo?: any;

  imagen?: string;
}