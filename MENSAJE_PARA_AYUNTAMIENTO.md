# Mensaje para el Ayuntamiento de Tlaquepaque – Requerimientos del Sistema de Obras

## Sobre el servidor que tienen (OP_SDOP10)

Revisando las especificaciones del servidor:
- **Sistema:** Windows Server 2022 Standard (64 bits)
- **Procesador:** Intel Xeon E-2414 2.61 GHz
- **RAM:** 16 GB
- **Disco:** 2 discos de 500 GB en RAID (espacio más que suficiente para el proyecto)

**Conclusión:** El equipo es adecuado para alojar el backend (APIs) y la base de datos del sistema. No es necesario cambiar de servidor por capacidad.

---

## Lo que sí van a necesitar tener instalado o verificar

### 1. Node.js
- **Versión:** 18 LTS o 20 LTS (64 bits).
- **Descarga:** https://nodejs.org/ (elegir la versión "LTS").
- Si no lo tienen, deben instalarlo.

### 2. PostgreSQL
- **Versión:** 18 (64 bits).
- **Descarga:** https://www.postgresql.org/download/windows/
- Deben crear una base de datos y un usuario para la aplicación (les puedo indicar los comandos o pasos).

### 3. Espacio en disco
- **Mínimo recomendado:** 10 GB libres en el disco donde se instalará todo.
- Sirve para: código del backend, base de datos y carpeta de imágenes/archivos (uploads).

### 4. Red y puertos
- Un **puerto abierto** para la aplicación (por ejemplo **3000**). Si usan otro, me lo indican.
- El puerto de PostgreSQL (**5432**) puede quedar solo para uso interno en el servidor.

### 5. Permisos
- Posibilidad de instalar Node.js y PostgreSQL.
- Acceso para copiar la carpeta del proyecto y configurar un servicio o tarea programada para que el backend quede corriendo siempre.

---

## Lo que yo les voy a mandar (en esta primera entrega)

Son **3 cosas**:

1. **Carpeta del backend comprimida** (ej. `back-tlaquepaque.zip`)  
   Incluye el código de las APIs y la carpeta `uploads` (imágenes y archivos que ya usa el sistema).

2. **Backup de la base de datos (.dump)**  
   Archivo con la base de datos completa: estructura de tablas **y todos los datos**. Lo restauran en su PostgreSQL con el comando que les indicaré en las instrucciones.

3. **Este documento** (MENSAJE_PARA_AYUNTAMIENTO)  
   Para que sepan qué necesitan tener instalado y qué información me tienen que confirmar.

**Después de que me respondan** con la información que pido abajo, les preparo y mando:
- **Instrucciones de instalación** paso a paso (instalar dependencias, configurar variables, restaurar el .dump, dejar el backend corriendo en Windows Server).
- **Archivo de ejemplo de configuración** (`.env.example`) con las variables que deban completar.

---

## Información que necesito que me confirmen

Para dejarles las instrucciones y el archivo de configuración listos:

1. **¿Tienen ya Node.js y/o PostgreSQL instalados?**  
   Si sí, ¿qué versiones? (pueden escribirla o mandar captura de "Acerca de" o de la consola.)

2. **¿Cuánto espacio libre tienen en el disco donde instalarían el proyecto?**  
   (En "Este equipo" pueden ver los GB libres.)

3. **¿Qué puerto quieren usar para la aplicación?**  
   Por defecto uso el **3000**; si tienen otro estándar, me lo dicen.

4. **¿PostgreSQL lo instalarán en el mismo servidor (OP_SDOP10)?**  
   Si la base de datos va en otro equipo, necesito la IP o nombre del servidor donde estará PostgreSQL.

5. **¿Qué usuario y contraseña quieren para la base de datos?**  
   O si prefieren, les propongo un usuario genérico (por ejemplo `tlaquepaque_app`) y ellos definen la contraseña y me la comparten de forma segura.

---

## Resumen en una frase

**En esta entrega:** les mando la carpeta del backend, el backup de la base de datos (.dump) con todo y datos, y este documento.  
**Ustedes:** me confirman los puntos de la sección anterior (versiones, espacio, puerto, usuario de BD, etc.).  
**Después:** con lo que me respondan, les preparo las instrucciones de instalación ya adaptadas a su servidor (OP_SDOP10, Windows Server 2022) y el archivo de configuración de ejemplo.
