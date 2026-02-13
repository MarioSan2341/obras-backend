# 🔧 Migración del Tipo de Columna 'clave'

## Problema
La columna `clave` en la tabla `usuarios` está definida como tipo `INTEGER`, pero necesitamos almacenar contraseñas hasheadas con bcrypt (que son strings de ~60 caracteres).

## Solución

### Opción 1: Ejecutar SQL directamente (Recomendado)

1. **Abre tu cliente de PostgreSQL** (pgAdmin, DBeaver, psql, etc.)

2. **Conéctate a tu base de datos**

3. **Ejecuta el siguiente SQL:**

```sql
ALTER TABLE usuarios 
ALTER COLUMN clave TYPE VARCHAR(255) 
USING CASE 
  WHEN clave IS NULL THEN NULL
  ELSE clave::text
END;
```

4. **Verifica que funcionó:**

```sql
SELECT column_name, data_type, character_maximum_length
FROM information_schema.columns
WHERE table_name = 'usuarios' AND column_name = 'clave';
```

Deberías ver: `data_type = 'character varying'` y `character_maximum_length = 255`

### Opción 2: Usar el archivo SQL incluido

Ejecuta el archivo `migrar-tipo-clave.sql` que está en la carpeta `scripts/`

---

## ⚠️ IMPORTANTE

- **Haz un backup** de tu base de datos antes de ejecutar la migración
- Si tienes contraseñas numéricas existentes, se convertirán a texto
- Después de ejecutar esto, reinicia el servidor backend

---

## Verificación Post-Migración

Después de ejecutar la migración, verifica que todo funciona:

1. **Reinicia el backend:**
   ```bash
   # Detén el servidor (Ctrl+C)
   npm run start:dev
   ```

2. **Intenta crear un nuevo usuario** desde el frontend

3. **Verifica en la BD que la contraseña se guardó como hash:**
   ```sql
   SELECT usuario, LEFT(clave, 10) as inicio_hash
   FROM usuarios
   ORDER BY id_usuarios DESC
   LIMIT 5;
   ```

Deberías ver hashes que empiezan con `$2a$`, `$2b$` o `$2y$`

---

## Si algo sale mal

Si necesitas revertir el cambio (aunque no debería ser necesario):

```sql
-- ⚠️ SOLO si necesitas revertir (no recomendado)
ALTER TABLE usuarios 
ALTER COLUMN clave TYPE INTEGER 
USING CASE 
  WHEN clave IS NULL THEN NULL
  WHEN clave ~ '^[0-9]+$' THEN clave::integer
  ELSE NULL
END;
```
