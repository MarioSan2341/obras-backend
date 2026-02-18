# Cómo hacer el dump de la base de datos

## Requisito previo

Necesitas tener instalado `pg_dump` en tu computadora. Viene incluido con PostgreSQL.

**Si no lo tienes instalado:**
- Descarga PostgreSQL desde: https://www.postgresql.org/download/windows/
- O solo las herramientas: https://www.enterprisedb.com/downloads/postgres-postgresql-downloads

---

## Opción 1: Formato Custom (.dump) - RECOMENDADO

Este formato es más eficiente y preserva mejor la estructura de la base de datos.

### Desde PowerShell o CMD:

```powershell
pg_dump -h postgresql://mario:d0xNwyHGFlWUkG43ch0aXKbIg2MMX5yu@dpg-d5l934n5r7bs73cjvcng-a.oregon-postgres.render.com/tlaquepaquedb `
        -p 5432 `
        -U mario `
        -d tlaquepaquedb `
        -F c `
        -f backup_tlaquepaque.dump
```

**Te pedirá la contraseña:** `d0xNwyHGFlWUkG43ch0aXKbIg2MMX5yu`

**Explicación:**
- `-h`: host (servidor de Render)
- `-p`: puerto (5432)
- `-U`: usuario (mario)
- `-d`: nombre de la base de datos (tlaquepaquedb)
- `-F c`: formato custom (binario comprimido)
- `-f`: nombre del archivo de salida

---

## Opción 2: Formato SQL plano (.sql)

Este formato es texto plano, más fácil de revisar pero ocupa más espacio.

```powershell
pg_dump -h dpg-d5l934n5r7bs73cjvcng-a.oregon-postgres.render.com `
        -p 5432 `
        -U mario `
        -d tlaquepaquedb `
        -f backup_tlaquepaque.sql
```

**Te pedirá la contraseña:** `d0xNwyHGFlWUkG43ch0aXKbIg2MMX5yu`

---

## Opción 3: Usar variable de entorno para la contraseña

Si prefieres no escribir la contraseña manualmente:

**En PowerShell:**
```powershell
$env:PGPASSWORD="d0xNwyHGFlWUkG43ch0aXKbIg2MMX5yu"
pg_dump -h dpg-d5l934n5r7bs73cjvcng-a.oregon-postgres.render.com -p 5432 -U mario -d tlaquepaquedb -F c -f backup_tlaquepaque.dump
```

**En CMD:**
```cmd
set PGPASSWORD=d0xNwyHGFlWUkG43ch0aXKbIg2MMX5yu
pg_dump -h dpg-d5l934n5r7bs73cjvcng-a.oregon-postgres.render.com -p 5432 -U mario -d tlaquepaquedb -F c -f backup_tlaquepaque.dump
```

---

## Verificar que el dump se creó correctamente

Después de ejecutar el comando, verifica que el archivo se creó:

```powershell
# Ver tamaño del archivo
Get-Item backup_tlaquepaque.dump | Select-Object Name, Length

# O simplemente verificar que existe
Test-Path backup_tlaquepaque.dump
```

El archivo debería tener un tamaño considerable (depende de cuántos datos tengas).

---

## Recomendación

**Usa la Opción 1 (formato .dump)** porque:
- Es más eficiente (comprimido)
- Preserva mejor la estructura
- Es el formato estándar para backups de PostgreSQL
- En el servidor del Ayuntamiento lo restaurarán con `pg_restore` (más rápido)

---

## Nota importante

El archivo `.dump` o `.sql` contiene **todos los datos** de tu base de datos. Asegúrate de:
- Guardarlo en un lugar seguro
- No compartirlo públicamente
- Enviarlo al Ayuntamiento de forma segura (por ejemplo, comprimido con contraseña o por un canal seguro)
