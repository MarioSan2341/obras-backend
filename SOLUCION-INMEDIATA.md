# ⚠️ SOLUCIÓN INMEDIATA - Cambiar Tipo de Columna

## El Problema
La columna `clave` en tu tabla `usuarios` es de tipo **INTEGER**, pero necesitas guardar strings (hashes bcrypt).

## Solución Rápida (5 minutos)

### Paso 1: Abre tu cliente de PostgreSQL
- pgAdmin, DBeaver, psql, o cualquier cliente SQL

### Paso 2: Conéctate a tu base de datos
Usa las credenciales de tu archivo `.env`:
- Host: `DB_HOST`
- Port: `DB_PORT`
- Database: `DB_NAME`
- User: `DB_USER`
- Password: `DB_PASS`

### Paso 3: Ejecuta ESTE SQL (copia y pega):

```sql
-- Cambiar tipo de columna clave de INTEGER a VARCHAR(255)
ALTER TABLE usuarios 
ALTER COLUMN clave TYPE VARCHAR(255) 
USING CASE 
  WHEN clave IS NULL THEN NULL
  ELSE clave::text
END;
```

### Paso 4: Verifica que funcionó:

```sql
SELECT column_name, data_type, character_maximum_length
FROM information_schema.columns
WHERE table_name = 'usuarios' AND column_name = 'clave';
```

**Resultado esperado:**
- `data_type` = `character varying`
- `character_maximum_length` = `255`

### Paso 5: Reinicia el backend
```bash
# En la terminal del backend, presiona Ctrl+C
# Luego ejecuta:
npm run start:dev
```

### Paso 6: Prueba crear un usuario
Debería funcionar ahora sin errores.

---

## Si no tienes acceso a PostgreSQL directamente

### Opción A: Usar psql desde la terminal

```bash
# Conéctate a tu base de datos
psql -h tu_host -U tu_usuario -d tu_base_de_datos

# Luego ejecuta el SQL:
ALTER TABLE usuarios ALTER COLUMN clave TYPE VARCHAR(255) USING CASE WHEN clave IS NULL THEN NULL ELSE clave::text END;
```

### Opción B: Usar un script Node.js temporal

Crea un archivo `fix-clave-type.js` en la raíz del proyecto:

```javascript
const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  ssl: { rejectUnauthorized: false }
});

async function fixClaveType() {
  try {
    await client.connect();
    console.log('Conectado a la base de datos');
    
    const result = await client.query(`
      ALTER TABLE usuarios 
      ALTER COLUMN clave TYPE VARCHAR(255) 
      USING CASE 
        WHEN clave IS NULL THEN NULL
        ELSE clave::text
      END;
    `);
    
    console.log('✅ Columna clave cambiada a VARCHAR(255)');
    
    const verify = await client.query(`
      SELECT column_name, data_type, character_maximum_length
      FROM information_schema.columns
      WHERE table_name = 'usuarios' AND column_name = 'clave';
    `);
    
    console.log('Verificación:', verify.rows[0]);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

fixClaveType();
```

Luego ejecuta:
```bash
node fix-clave-type.js
```

---

## ⚠️ IMPORTANTE

**NO puedes continuar sin ejecutar este SQL.** El código está correcto, pero la base de datos tiene el tipo de columna incorrecto.

Una vez que ejecutes el SQL, todo funcionará correctamente.
