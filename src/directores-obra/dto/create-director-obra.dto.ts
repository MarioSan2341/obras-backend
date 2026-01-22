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
   activo?: boolean;

  oficio_autorizacion_ro?: string;
  oficio_autorizacion_rp?: string;
  oficio_autorizacion_pu?: string;

  ro_edificacion?: boolean;
  ro_restauracion?: boolean;
  ro_urbanizacion?: boolean;
  ro_infraestructura?: boolean;

  rp_edificacion?: boolean;
  rp_restauracion?: boolean;
  rp_urbanizacion?: boolean;
  rp_infraestructura?: boolean;
}
