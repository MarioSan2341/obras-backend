import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DirectorObra } from './director-obra.entity';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class DirectoresObraService {
  constructor(
    @InjectRepository(DirectorObra)
    private repo: Repository<DirectorObra>,
  ) {}

  private toBool(value: any): boolean {
    return value === true || value === 'true' || value === 1 || value === '1';
  }

  private parseDate(value: any): Date | null {
    if (!value) return null;
    if (value === 'null' || value === '' || value === 'undefined') return null;
    
    try {
      // Si viene en formato YYYY-MM-DD (desde el input date)
      if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
        // Simplemente agregar 'T00:00:00' para evitar problemas de zona horaria
        return new Date(`${value}T12:00:00`);
      }
      
      // Si ya es un objeto Date o timestamp
      const date = new Date(value);
      return isNaN(date.getTime()) ? null : date;
    } catch {
      return null;
    }
  }

  async create(data: any) {
    const { file, ...body } = data;

    let imagen: string | null = null;
    if (file) {
      imagen = await this.guardarImagen(file);
    }

    const director = this.repo.create({
      ...body,

      ro_edificacion: this.toBool(body.ro_edificacion),
      ro_restauracion: this.toBool(body.ro_restauracion),
      ro_urbanizacion: this.toBool(body.ro_urbanizacion),
      ro_infraestructura: this.toBool(body.ro_infraestructura),

      rp_edificacion: this.toBool(body.rp_edificacion),
      rp_restauracion: this.toBool(body.rp_restauracion),
      rp_urbanizacion: this.toBool(body.rp_urbanizacion),
      rp_infraestructura: this.toBool(body.rp_infraestructura),

      activo: body.activo !== undefined ? this.toBool(body.activo) : true,

      imagen,
      fecha_registro: new Date(),
      // Usar parseDate que maneja UTC
      fecha_actualizacion: this.parseDate(body.fecha_actualizacion),
      fecha_baja: null,
    });

    return this.repo.save(director);
  }

  async update(id: number, data: any, file?: Express.Multer.File) {
    const director = await this.repo.findOne({ where: { id } });

    if (!director) throw new Error('Director no encontrado');

    // Verificar si se solicita eliminar la imagen
    const eliminarImagen = data.eliminar_imagen === 'true' || data.eliminar_imagen === true;

    // Verificar si está cambiando el estado 'activo'
    const nuevoEstadoActivo = data.activo !== undefined ? this.toBool(data.activo) : director.activo;
    const estadoAnterior = director.activo;

    // Actualizar fecha_baja según el cambio de estado
    let fechaBajaActualizada = director.fecha_baja;
    
    if (!nuevoEstadoActivo && estadoAnterior) {
      // Si se está desactivando (de true a false)
      fechaBajaActualizada = new Date();
    } else if (nuevoEstadoActivo && !estadoAnterior) {
      // Si se está reactivando (de false a true)
      fechaBajaActualizada = null;
    }

    // Manejo de imagen
    if (eliminarImagen && director.imagen) {
      await this.eliminarImagen(director.imagen);
      director.imagen = null;
    } else if (file) {
      if (director.imagen) await this.eliminarImagen(director.imagen);
      director.imagen = await this.guardarImagen(file);
    }

    // Actualizar otros campos
    Object.assign(director, {
      ...data,

      // Manejar campos que pueden ser null/empty string
      oficio_autorizacion_ro: data.oficio_autorizacion_ro !== undefined 
        ? (data.oficio_autorizacion_ro === '' ? null : data.oficio_autorizacion_ro) 
        : director.oficio_autorizacion_ro,

      oficio_autorizacion_rp: data.oficio_autorizacion_rp !== undefined 
        ? (data.oficio_autorizacion_rp === '' ? null : data.oficio_autorizacion_rp) 
        : director.oficio_autorizacion_rp,

      oficio_autorizacion_pu: data.oficio_autorizacion_pu !== undefined 
        ? (data.oficio_autorizacion_pu === '' ? null : data.oficio_autorizacion_pu) 
        : director.oficio_autorizacion_pu,

      ro_edificacion: data.ro_edificacion !== undefined ? this.toBool(data.ro_edificacion) : director.ro_edificacion,
      ro_restauracion: data.ro_restauracion !== undefined ? this.toBool(data.ro_restauracion) : director.ro_restauracion,
      ro_urbanizacion: data.ro_urbanizacion !== undefined ? this.toBool(data.ro_urbanizacion) : director.ro_urbanizacion,
      ro_infraestructura: data.ro_infraestructura !== undefined ? this.toBool(data.ro_infraestructura) : director.ro_infraestructura,

      rp_edificacion: data.rp_edificacion !== undefined ? this.toBool(data.rp_edificacion) : director.rp_edificacion,
      rp_restauracion: data.rp_restauracion !== undefined ? this.toBool(data.rp_restauracion) : director.rp_restauracion,
      rp_urbanizacion: data.rp_urbanizacion !== undefined ? this.toBool(data.rp_urbanizacion) : director.rp_urbanizacion,
      rp_infraestructura: data.rp_infraestructura !== undefined ? this.toBool(data.rp_infraestructura) : director.rp_infraestructura,

      activo: data.activo !== undefined ? this.toBool(data.activo) : director.activo,
      fecha_actualizacion: data.fecha_actualizacion !== undefined 
        ? this.parseDate(data.fecha_actualizacion) 
        : director.fecha_actualizacion,
      fecha_baja: fechaBajaActualizada,
    });

    return this.repo.save(director);
  }

  async baja(id: number) {
    const director = await this.repo.findOne({ where: { id } });
    
    if (!director) {
      throw new Error('Director no encontrado');
    }

    return this.repo.update(id, {
      activo: false,
      fecha_baja: new Date(),
    });
  }

  async reactivar(id: number) {
    const director = await this.repo.findOne({ where: { id } });
    
    if (!director) {
      throw new Error('Director no encontrado');
    }

    return this.repo.update(id, {
      activo: true,
      fecha_baja: null,
    });
  }

  findAll() {
    return this.repo.find({
      order: {
        activo: 'DESC',
        fecha_registro: 'DESC'
      }
    });
  }

  findOne(id: number) {
    return this.repo.findOne({ where: { id } });
  }

  // ================= IMÁGENES =================
  private async guardarImagen(file: Express.Multer.File): Promise<string> {
    const dir = path.join(__dirname, '..', '..', 'uploads', 'directores');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    const name = `director-${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`;
    fs.writeFileSync(path.join(dir, name), file.buffer);

    return `directores/${name}`;
  }

  private async eliminarImagen(nombre: string) {
    const fullPath = path.join(__dirname, '..', '..', 'uploads', nombre);
    if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
  }
}