import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { OpNumerosOficiales } from './op-numeros-oficiales.entity';
import { OpObra } from '../op_obras/op_obras.entity';
import { Colonia } from '../colonias/colonias.entity';

// 🔧 DEBUG: Cambia a true solo cuando necesites depurar
const DEBUG = false;

// Función helper para logs de depuración
function logDebug(...args: any[]): void {
  if (DEBUG) {
    console.log('[DEBUG]', ...args);
  }
}

@Injectable()
export class OpNumerosOficialesService {
  constructor(
    @InjectRepository(OpNumerosOficiales)
    private numerosOficialesRepository: Repository<OpNumerosOficiales>,
    @InjectRepository(OpObra)
    private obrasRepository: Repository<OpObra>,
    @InjectRepository(Colonia)
    private coloniasRepository: Repository<Colonia>,
  ) {}

  // Obtener todas las obras con sus números oficiales
  async findAllWithNumerosOficiales() {
    const obras = await this.obrasRepository.find({
      order: { idObra: 'DESC' },
    });

    const numerosOficiales = await this.numerosOficialesRepository.find({
      relations: ['obra'],
      order: { idnumerosoficialesobra: 'DESC' },
    });

    // Combinar obras con sus números oficiales
    return obras.map((obra) => {
      const numeros = numerosOficiales.filter(
        (num) => num.idobra === obra.idObra,
      );

      return {
        idObra: obra.idObra,
        consecutivo: obra.consecutivo,
        fechaCaptura: obra.fechaCaptura,
        nombrePropietario: obra.nombrePropietario,
        domicilioPropietario: obra.domicilioPropietario,
        manzanaObra: obra.manzanaObra,
        loteObra: obra.loteObra,
        estadoObra: obra.estadoObra,
        estadoPago: obra.estadoPago,
        numerosOficiales: numeros.map((num) => ({
          idnumerosoficialesobra: num.idnumerosoficialesobra,
          numerooficial: num.numerooficial,
          fechacreacionno: num.fechacreacionno,
          idusuariono: num.idusuariono,
          calle: num.calle,
        })),
      };
    });
  }

  // Obtener solo obras que tienen números oficiales
  async findObrasConNumerosOficiales() {
    try {
      // Obtener todos los números oficiales
      const numerosOficiales = await this.numerosOficialesRepository.find({
        order: { idnumerosoficialesobra: 'DESC' },
      });

      // Si no hay números oficiales, retornar array vacío
      if (!numerosOficiales || numerosOficiales.length === 0) {
        return [];
      }

      // Obtener los IDs únicos de obras
      const obraIds = [...new Set(numerosOficiales.map((num) => num.idobra))];

      // Si no hay IDs de obras, retornar array vacío
      if (!obraIds || obraIds.length === 0) {
        return [];
      }

      // Obtener las obras directamente (find() maneja mejor los valores null que QueryBuilder)
      const obras = await this.obrasRepository.find({
        where: { idObra: In(obraIds) },
      });

      // Obtener las colonias para hacer el JOIN manualmente
      const coloniaIds = [...new Set(obras.map((o) => o.idColoniaObra).filter((id) => id != null))];
      let coloniasMap = new Map<number, string>();
      let coloniasEncontradas = 0;
      
      if (coloniaIds.length > 0) {
        try {
          const colonias = await this.coloniasRepository.find({
            where: { id_colonia: In(coloniaIds) },
          });
          
          coloniasEncontradas = colonias.length;
          colonias.forEach((col) => {
            coloniasMap.set(col.id_colonia, col.nombre);
          });
        } catch (error) {
          console.error('Error al obtener colonias:', error);
          // Continuar sin colonias si hay error
        }
      }

      logDebug(`Números oficiales encontrados: ${numerosOficiales.length}`);
      logDebug(`IDs de obras únicos: ${obraIds.length}`);
      logDebug(`Obras encontradas: ${obras.length}`);
      logDebug(`Colonias encontradas: ${coloniasEncontradas}`);
      
      // Verificar que los campos se están cargando correctamente
      if (obras.length > 0) {
        const primeraObra = obras[0];
        logDebug(`Primera obra cargada - ID: ${primeraObra.idObra}`);
        logDebug(`Primera obra - manzanaObra: "${primeraObra.manzanaObra}" (tipo: ${typeof primeraObra.manzanaObra})`);
        logDebug(`Primera obra - loteObra: "${primeraObra.loteObra}" (tipo: ${typeof primeraObra.loteObra})`);
        logDebug(`Primera obra - etapaObra: "${primeraObra.etapaObra}" (tipo: ${typeof primeraObra.etapaObra})`);
        logDebug(`Primera obra - condominioObra: "${primeraObra.condominioObra}" (tipo: ${typeof primeraObra.condominioObra})`);
        
        // Buscar una obra que tenga al menos uno de estos campos con datos
        const obraConDatosEnCampos = obras.find(o => 
          (o.manzanaObra && o.manzanaObra !== 'null' && o.manzanaObra.trim() !== '') ||
          (o.loteObra && o.loteObra !== 'null' && o.loteObra.trim() !== '') ||
          (o.etapaObra && o.etapaObra !== 'null' && o.etapaObra.trim() !== '') ||
          (o.condominioObra && o.condominioObra !== 'null' && o.condominioObra.trim() !== '')
        );
        
        if (obraConDatosEnCampos) {
          logDebug(`Obra con datos en manzana/lote/etapa/condominio encontrada - ID: ${obraConDatosEnCampos.idObra}`);
          logDebug(`manzanaObra: "${obraConDatosEnCampos.manzanaObra}"`);
          logDebug(`loteObra: "${obraConDatosEnCampos.loteObra}"`);
          logDebug(`etapaObra: "${obraConDatosEnCampos.etapaObra}"`);
          logDebug(`condominioObra: "${obraConDatosEnCampos.condominioObra}"`);
        } else {
          logDebug(`No se encontró ninguna obra con datos en manzana/lote/etapa/condominio`);
        }
      }

      // Función helper para manejar valores null/undefined/vacíos y el string "null"
      // Regla de oro: NULL es NULL, "null" nunca debería existir
      const getValue = (value: any): string | null => {
        // Si es null o undefined, retornar null
        if (value === null || value === undefined) {
          return null;
        }
        
        // Si es el string "null" (literal) en cualquier variación, retornar null
        if (value === 'null' || value === 'NULL' || value === 'Null') {
          return null;
        }
        
        // Si es string vacío o solo espacios, retornar null
        if (typeof value === 'string') {
          const trimmed = value.trim();
          if (trimmed === '' || trimmed === 'null' || trimmed === 'NULL' || trimmed === 'Null') {
            return null;
          }
          return trimmed; // Retornar el string limpio
        }
        
        // Si es un objeto que representa null (TypeORM a veces devuelve esto)
        if (typeof value === 'object' && value !== null) {
          try {
            // Intentar convertir a string usando JSON.stringify primero
            const jsonString = JSON.stringify(value);
            if (jsonString === 'null' || jsonString === '{}' || jsonString === '[]') {
              return null;
            }
            
            // Intentar convertir a string normal
            const stringValue = String(value);
            // Si el string es "null", retornar null
            if (stringValue === 'null' || stringValue === 'NULL') {
              return null;
            }
            
            // Verificar si el objeto está vacío
            const keys = Object.keys(value);
            if (keys.length === 0) {
              return null;
            }
            
            // Si todas las propiedades son null/undefined, retornar null
            const allNull = keys.every(key => {
              const val = value[key];
              return val === null || val === undefined || val === 'null' || val === 'NULL';
            });
            if (allNull) {
              return null;
            }
            
            // Si el objeto tiene una sola propiedad que es null, retornar null
            if (keys.length === 1) {
              const val = value[keys[0]];
              if (val === null || val === undefined || val === 'null' || val === 'NULL') {
                return null;
              }
            }
            
            // Si llegamos aquí, el objeto tiene valores reales, intentar extraer el primer valor string
            // Esto puede pasar si TypeORM envuelve un valor en un objeto
            for (const key of keys) {
              const val = value[key];
              if (val !== null && val !== undefined && val !== 'null' && val !== 'NULL') {
                if (typeof val === 'string') {
                  return val.trim() === '' ? null : val;
                }
                return String(val);
              }
            }
            
            // Si no encontramos valores válidos, retornar null
            return null;
          } catch (e) {
            // Si hay error al convertir, retornar null por seguridad
            return null;
          }
        }
        
        // Si es string, retornarlo tal cual
        if (typeof value === 'string') {
          return value;
        }
        
        // Para cualquier otro tipo, intentar convertir a string
        try {
          const stringValue = String(value);
          return stringValue === 'null' || stringValue === 'NULL' ? null : stringValue;
        } catch (e) {
          return null;
        }
      };

      // Crear un mapa de obras por ID
      const obrasMap = new Map<number, any>();
      obras.forEach((obra) => {
        // Log para verificar valores antes de procesarlos (solo para obra 6739 que tiene condominioObra: "l")
        if (obra.idObra === 6739) {
          logDebug(`Procesando obra 6739:`);
          logDebug(`condominioObra raw:`, obra.condominioObra, `(tipo: ${typeof obra.condominioObra})`);
          logDebug(`condominioObra después de getValue:`, getValue(obra.condominioObra));
          logDebug(`etapaObra raw:`, obra.etapaObra, `(tipo: ${typeof obra.etapaObra})`);
          logDebug(`etapaObra después de getValue:`, getValue(obra.etapaObra));
        }
        
        obrasMap.set(obra.idObra, {
          idObra: obra.idObra,
          consecutivo: obra.consecutivo,
          fechaCaptura: obra.fechaCaptura,
          nombrePropietario: obra.nombrePropietario,
          domicilioPropietario: getValue(obra.domicilioPropietario),
          nombreColoniaObra: coloniasMap.get(obra.idColoniaObra) || null,
          manzanaObra: getValue(obra.manzanaObra),
          loteObra: getValue(obra.loteObra),
          estadoObra: obra.estadoObra,
          estadoPago: obra.estadoPago,
          tipoPropietario: getValue(obra.tipoPropietario),
          prediosContiguos: getValue(obra.numerosPrediosContiguosObra),
          condominio: getValue(obra.condominioObra),
          etapa: getValue(obra.etapaObra),
          entreCalle1: getValue(obra.entreCalle1Obra),
          entreCalle2: getValue(obra.entreCalle2Obra),
          destinoActual: getValue(obra.destinoActualProyeto),
          destinoPropuesto: getValue(obra.destinoPropuestoProyecto),
        });
      });
      
      // Log de ejemplo para verificar valores - buscar una obra que tenga datos
      const obraConDatos = obras.find(o => 
        o.manzanaObra || o.loteObra || o.condominioObra || o.etapaObra || 
        o.numerosPrediosContiguosObra || o.entreCalle1Obra || o.entreCalle2Obra
      );
      
      if (obraConDatos) {
        logDebug(`Obra con datos encontrada - ID: ${obraConDatos.idObra}`);
        logDebug(`manzanaObra: "${obraConDatos.manzanaObra}" (tipo: ${typeof obraConDatos.manzanaObra})`);
        logDebug(`loteObra: "${obraConDatos.loteObra}" (tipo: ${typeof obraConDatos.loteObra})`);
        logDebug(`condominioObra: "${obraConDatos.condominioObra}" (tipo: ${typeof obraConDatos.condominioObra})`);
        logDebug(`etapaObra: "${obraConDatos.etapaObra}" (tipo: ${typeof obraConDatos.etapaObra})`);
        logDebug(`numerosPrediosContiguosObra: "${obraConDatos.numerosPrediosContiguosObra}" (tipo: ${typeof obraConDatos.numerosPrediosContiguosObra})`);
        logDebug(`entreCalle1Obra: "${obraConDatos.entreCalle1Obra}" (tipo: ${typeof obraConDatos.entreCalle1Obra})`);
        logDebug(`entreCalle2Obra: "${obraConDatos.entreCalle2Obra}" (tipo: ${typeof obraConDatos.entreCalle2Obra})`);
        
        // Verificar el valor mapeado en el mapa
        const obraMapeada = obrasMap.get(obraConDatos.idObra);
        if (obraMapeada) {
          logDebug(`Obra mapeada - entreCalle1: "${obraMapeada.entreCalle1}" (tipo: ${typeof obraMapeada.entreCalle1})`);
          logDebug(`Obra mapeada - entreCalle2: "${obraMapeada.entreCalle2}" (tipo: ${typeof obraMapeada.entreCalle2})`);
        }
      } else {
        logDebug(`No se encontró ninguna obra con datos en esos campos`);
      }
      
      logDebug(`Tamaño del mapa de obras creado: ${obrasMap.size}`);
      if (obrasMap.size > 0) {
        const primeraObraId = Array.from(obrasMap.keys())[0];
        logDebug(`Primera clave en el mapa: ${primeraObraId} (tipo: ${typeof primeraObraId})`);
      }
      
      if (numerosOficiales.length > 0) {
        logDebug(`Primer número oficial - idobra: ${numerosOficiales[0].idobra} (tipo: ${typeof numerosOficiales[0].idobra})`);
      }

      // Agrupar números oficiales por obra
      const resultadoMap = new Map();

      logDebug(`Tamaño del mapa de obras: ${obrasMap.size}`);
      
      // Buscar una obra específica que tenga entreCalle1Obra con datos
      const obraConEntreCalle = obras.find(o => o.entreCalle1Obra && o.entreCalle1Obra !== 'null' && o.entreCalle1Obra.trim() !== '');
      if (obraConEntreCalle) {
        const obraDelMapa = obrasMap.get(obraConEntreCalle.idObra);
        logDebug(`Obra con entreCalle1Obra encontrada - ID: ${obraConEntreCalle.idObra}`);
        logDebug(`Valor original entreCalle1Obra: "${obraConEntreCalle.entreCalle1Obra}"`);
        logDebug(`Valor en mapa entreCalle1: "${obraDelMapa?.entreCalle1}"`);
      }
      
      numerosOficiales.forEach((num) => {
        const obraId = num.idobra;
        const obra = obrasMap.get(obraId);

        if (!obra) {
          logDebug(`Obra con ID ${obraId} no encontrada en el mapa`);
          return; // Skip si la obra no existe
        }

        if (!resultadoMap.has(obraId)) {
          const obraResultado = {
            ...obra,
            numerosOficiales: [],
          };
          
          // Log para verificar que los valores se copian correctamente (solo para obra 6733)
          if (obraId === 6733) {
            logDebug(`Creando resultado para obra 6733:`);
            logDebug(`Obra original - entreCalle1: "${obra.entreCalle1}" (tipo: ${typeof obra.entreCalle1})`);
            logDebug(`Obra resultado - entreCalle1: "${obraResultado.entreCalle1}" (tipo: ${typeof obraResultado.entreCalle1})`);
          }
          
          resultadoMap.set(obraId, obraResultado);
        }

        resultadoMap.get(obraId).numerosOficiales.push({
          idnumerosoficialesobra: num.idnumerosoficialesobra,
          numerooficial: num.numerooficial,
          fechacreacionno: num.fechacreacionno,
          idusuariono: num.idusuariono,
          calle: num.calle,
        });
      });

      logDebug(`Tamaño del mapa de resultados después de agrupar: ${resultadoMap.size}`);

      // Ordenar por idObra descendente
      const resultados = Array.from(resultadoMap.values());
      resultados.sort((a, b) => b.idObra - a.idObra);
      
      // Función helper para limpiar un valor específico
      // Valida números para etapa y condominio, rechaza letras sueltas
      const limpiarValor = (val: any, campo?: string): string | null => {
        const valorLimpio = getValue(val);
        
        // Si getValue retorna null, retornar null real
        if (valorLimpio === null || valorLimpio === undefined) {
          return null;
        }
        
        // Si es string, validar y limpiar
        if (typeof valorLimpio === 'string') {
          const trimmed = valorLimpio.trim();
          
          // Si está vacío después de trim, retornar null
          if (trimmed === '') {
            return null;
          }
          
          // Validación especial para etapa y condominio (deben ser numéricos)
          if (campo === 'etapa' || campo === 'condominio') {
            // Rechazar letras sueltas como "l", "a", etc.
            if (trimmed.length === 1 && !/^\d$/.test(trimmed)) {
              return null; // Rechazar letras sueltas
            }
            // Si es un número válido, retornarlo
            if (/^\d+$/.test(trimmed)) {
              return trimmed;
            }
            // Si no es numérico y tiene más de 1 carácter, puede ser válido (ej: "01", "1A", etc.)
            // Pero si es solo una letra, rechazarlo
            if (trimmed.length === 1) {
              return null;
            }
          }
          
          return trimmed;
        }
        
        // Para cualquier otro tipo, convertir a string o null
        try {
          const str = String(valorLimpio).trim();
          if (str === 'null' || str === 'NULL' || str === '') {
            return null;
          }
          
          // Validación especial para etapa y condominio
          if (campo === 'etapa' || campo === 'condominio') {
            if (str.length === 1 && !/^\d$/.test(str)) {
              return null; // Rechazar letras sueltas
            }
          }
          
          return str;
        } catch {
          return null;
        }
      };

      // Limpiar valores null antes de retornar (asegurar que los objetos null se conviertan a null real)
      const resultadosLimpios = resultados.map(obra => {
        return {
          ...obra,
          manzanaObra: limpiarValor(obra.manzanaObra),
          loteObra: limpiarValor(obra.loteObra),
          condominio: limpiarValor(obra.condominio, 'condominio'), // Validar que sea numérico
          etapa: limpiarValor(obra.etapa, 'etapa'), // Validar que sea numérico
          prediosContiguos: limpiarValor(obra.prediosContiguos),
          entreCalle1: limpiarValor(obra.entreCalle1),
          entreCalle2: limpiarValor(obra.entreCalle2),
          destinoActual: limpiarValor(obra.destinoActual),
          destinoPropuesto: limpiarValor(obra.destinoPropuesto),
          tipoPropietario: limpiarValor(obra.tipoPropietario),
          domicilioPropietario: limpiarValor(obra.domicilioPropietario),
        };
      });

      logDebug(`Resultados finales: ${resultadosLimpios.length} obras`);
      if (resultadosLimpios.length > 0) {
        const primeraObra = resultadosLimpios[0];
        logDebug(`Primera obra ID: ${primeraObra.idObra}`);
        logDebug(`Primera obra - entreCalle1: "${primeraObra.entreCalle1}" (tipo: ${typeof primeraObra.entreCalle1})`);
        logDebug(`Primera obra - entreCalle2: "${primeraObra.entreCalle2}" (tipo: ${typeof primeraObra.entreCalle2})`);
        
        // Verificar algunas obras con datos para confirmar que los valores se están procesando correctamente
        const obra6733 = resultadosLimpios.find(r => r.idObra === 6733);
        const obra6739 = resultadosLimpios.find(r => r.idObra === 6739);
        const obra16084 = resultadosLimpios.find(r => r.idObra === 16084);
        
        if (obra6733) {
          logDebug(`Obra 6733 - entreCalle1: ${obra6733.entreCalle1}, entreCalle2: ${obra6733.entreCalle2}`);
        }
        if (obra6739) {
          logDebug(`Obra 6739 - condominio: ${obra6739.condominio}`);
        }
        if (obra16084) {
          logDebug(`Obra 16084 - etapa: ${obra16084.etapa}`);
        }
        
        logDebug(`Primera obra completa:`, JSON.stringify(primeraObra, null, 2));
      }

      return resultadosLimpios;
    } catch (error) {
      console.error('Error en findObrasConNumerosOficiales:', error);
      throw error;
    }
  }

  // Obtener obras con números oficiales con filtros opcionales (optimizado con filtros en BD)
  async findObrasConNumerosOficialesFiltrado(
    consecutivo?: string,
    numeroOficial?: string,
    calle?: string,
  ) {
    // Si no hay filtros, usar el método original
    if (!consecutivo && !numeroOficial && !calle) {
      return this.findObrasConNumerosOficiales();
    }

    try {
      // Construir query optimizada con filtros en la BD
      const queryBuilder = this.numerosOficialesRepository
        .createQueryBuilder('num')
        .select('num.idobra', 'idobra')
        .distinct(true);

      // Filtrar por número oficial
      if (numeroOficial && numeroOficial.trim()) {
        queryBuilder.andWhere('LOWER(num.numerooficial) LIKE LOWER(:numeroOficial)', {
          numeroOficial: `%${numeroOficial.trim()}%`,
        });
      }

      // Filtrar por calle
      if (calle && calle.trim()) {
        queryBuilder.andWhere('LOWER(num.calle) LIKE LOWER(:calle)', {
          calle: `%${calle.trim()}%`,
        });
      }

      // Obtener IDs de obras que cumplen los filtros de números oficiales
      const obrasIdsConFiltros = await queryBuilder.getRawMany();
      const obraIds = obrasIdsConFiltros.map((r) => r.idobra);

      // Si hay filtro de consecutivo, también filtrar obras
      let obrasFiltradas: OpObra[] = [];
      if (consecutivo && consecutivo.trim()) {
        if (obraIds.length > 0) {
          obrasFiltradas = await this.obrasRepository
            .createQueryBuilder('obra')
            .where('obra.idobra IN (:...ids)', { ids: obraIds })
            .andWhere('LOWER(obra.consecutivo) LIKE LOWER(:consecutivo)', {
              consecutivo: `%${consecutivo.trim()}%`,
            })
            .getMany();
        }
      } else {
        if (obraIds.length > 0) {
          obrasFiltradas = await this.obrasRepository.find({
            where: { idObra: In(obraIds) },
          });
        }
      }

      if (obrasFiltradas.length === 0) {
        return [];
      }

      // Obtener números oficiales solo de las obras filtradas, aplicando filtros directamente en BD
      const obrasIdsFinales = obrasFiltradas.map((o) => o.idObra);
      
      const numerosQueryBuilder = this.numerosOficialesRepository
        .createQueryBuilder('num')
        .where('num.idobra IN (:...ids)', { ids: obrasIdsFinales });

      if (numeroOficial && numeroOficial.trim()) {
        numerosQueryBuilder.andWhere('LOWER(num.numerooficial) LIKE LOWER(:numeroOficial)', {
          numeroOficial: `%${numeroOficial.trim()}%`,
        });
      }

      if (calle && calle.trim()) {
        numerosQueryBuilder.andWhere('LOWER(num.calle) LIKE LOWER(:calle)', {
          calle: `%${calle.trim()}%`,
        });
      }

      const numerosFiltrados = await numerosQueryBuilder
        .orderBy('num.idnumerosoficialesobra', 'DESC')
        .getMany();

      // Obtener colonias
      const coloniaIds = [...new Set(obrasFiltradas.map((o) => o.idColoniaObra).filter((id) => id != null))];
      const coloniasMap = new Map<number, string>();
      if (coloniaIds.length > 0) {
        const colonias = await this.coloniasRepository.find({
          where: { id_colonia: In(coloniaIds) },
        });
        colonias.forEach((col) => {
          coloniasMap.set(col.id_colonia, col.nombre);
        });
      }

      // Helper para limpiar valores
      const getValue = (value: any): string | null => {
        if (value === null || value === undefined) return null;
        if (value === 'null' || value === 'NULL' || value === 'Null') return null;
        if (typeof value === 'string') {
          const trimmed = value.trim();
          if (trimmed === '' || trimmed === 'null' || trimmed === 'NULL') return null;
          return trimmed;
        }
        return null;
      };

      // Agrupar números oficiales por obra y construir resultado
      const obrasMap = new Map();
      obrasFiltradas.forEach((obra) => {
        obrasMap.set(obra.idObra, {
          idObra: obra.idObra,
          consecutivo: obra.consecutivo,
          fechaCaptura: obra.fechaCaptura,
          nombrePropietario: obra.nombrePropietario,
          domicilioPropietario: getValue(obra.domicilioPropietario),
          nombreColoniaObra: coloniasMap.get(obra.idColoniaObra) || null,
          manzanaObra: getValue(obra.manzanaObra),
          loteObra: getValue(obra.loteObra),
          estadoObra: obra.estadoObra,
          estadoPago: obra.estadoPago,
          tipoPropietario: getValue(obra.tipoPropietario),
          prediosContiguos: getValue(obra.numerosPrediosContiguosObra),
          condominio: getValue(obra.condominioObra),
          etapa: getValue(obra.etapaObra),
          entreCalle1: getValue(obra.entreCalle1Obra),
          entreCalle2: getValue(obra.entreCalle2Obra),
          destinoActual: getValue(obra.destinoActualProyeto),
          destinoPropuesto: getValue(obra.destinoPropuestoProyecto),
          numerosOficiales: [],
        });
      });

      // Agregar números oficiales a cada obra
      numerosFiltrados.forEach((num) => {
        const obra = obrasMap.get(num.idobra);
        if (obra) {
          obra.numerosOficiales.push({
            idnumerosoficialesobra: num.idnumerosoficialesobra,
            numerooficial: num.numerooficial,
            fechacreacionno: num.fechacreacionno,
            idusuariono: num.idusuariono,
            calle: num.calle,
          });
        }
      });

      // Retornar solo obras que tienen números oficiales después del filtrado
      const resultados = Array.from(obrasMap.values()).filter(
        (obra) => obra.numerosOficiales.length > 0,
      );
      resultados.sort((a, b) => b.idObra - a.idObra);

      return resultados;
    } catch (error) {
      console.error('Error en findObrasConNumerosOficialesFiltrado:', error);
      throw error;
    }
  }
}
