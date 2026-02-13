# 🔍 Guía para Verificar el Hashing de Contraseñas

## Método 1: Script de Verificación (Más Fácil) ⭐

Ejecuta este comando para ver un reporte completo del estado de todas las contraseñas:

```bash
cd obras-backend
npm run verify:passwords
```

Esto te mostrará:
- ✅ Contraseñas hasheadas
- ⚠️ Contraseñas en texto plano
- ❌ Usuarios sin contraseña
- 📊 Resumen estadístico

---

## Método 2: Verificar en la Base de Datos Directamente

### Con PostgreSQL (pgAdmin o psql):

```sql
-- Ver el estado de todas las contraseñas
SELECT 
  id_usuarios,
  usuario,
  nombre,
  CASE 
    WHEN clave IS NULL OR clave = '' THEN 'Sin contraseña'
    WHEN clave LIKE '$2a$%' OR clave LIKE '$2b$%' OR clave LIKE '$2y$%' THEN '✅ Hasheada'
    ELSE '⚠️ Texto plano'
  END as estado_contraseña,
  LENGTH(clave) as longitud_clave,
  LEFT(clave, 10) as muestra_clave
FROM usuarios
ORDER BY id_usuarios;
```

### Ver solo las que están en texto plano:

```sql
SELECT id_usuarios, usuario, nombre
FROM usuarios
WHERE clave IS NOT NULL 
  AND clave != ''
  AND clave NOT LIKE '$2a$%'
  AND clave NOT LIKE '$2b$%'
  AND clave NOT LIKE '$2y$%';
```

### Contar por estado:

```sql
SELECT 
  CASE 
    WHEN clave IS NULL OR clave = '' THEN 'Sin contraseña'
    WHEN clave LIKE '$2a$%' OR clave LIKE '$2b$%' OR clave LIKE '$2y$%' THEN 'Hasheada'
    ELSE 'Texto plano'
  END as estado,
  COUNT(*) as cantidad
FROM usuarios
GROUP BY estado;
```

---

## Método 3: Probar el Login

### Paso 1: Verificar que el login funciona con contraseñas hasheadas

1. **Abre tu aplicación frontend**
2. **Intenta hacer login con un usuario existente**
3. **Si funciona correctamente**, significa que el sistema está comparando correctamente con el hash

### Paso 2: Crear un nuevo usuario y verificar

1. **Crea un nuevo usuario desde el frontend** (como ADMIN)
2. **Verifica en la BD** que su contraseña esté hasheada:

```sql
SELECT usuario, LEFT(clave, 10) as inicio_hash
FROM usuarios
WHERE usuario = 'nombre_del_nuevo_usuario';
```

Deberías ver algo como: `$2a$10$...` o `$2b$10$...`

---

## Método 4: Probar la Migración

### Paso 1: Verificar estado antes

```bash
npm run verify:passwords
```

### Paso 2: Ejecutar la migración

```bash
npm run migrate:passwords 1 tu_clave_admin
```

### Paso 3: Verificar estado después

```bash
npm run verify:passwords
```

Deberías ver que todas las contraseñas ahora están hasheadas (✅).

---

## Método 5: Probar con el Endpoint REST

### Verificar estado actual:

```bash
npm run verify:passwords
```

### Ejecutar migración vía API:

```bash
curl -X POST http://localhost:3001/usuarios/migrar-contraseñas \
  -H "Content-Type: application/json" \
  -d '{
    "idAdmin": 1,
    "claveAdmin": "tu_clave_admin"
  }'
```

Respuesta esperada:
```json
{
  "mensaje": "Migración completada. X contraseñas hasheadas.",
  "usuariosActualizados": X
}
```

### Verificar estado después:

```bash
npm run verify:passwords
```

---

## ✅ Checklist de Verificación

- [ ] Ejecuté `npm run verify:passwords` y veo el estado de las contraseñas
- [ ] Las contraseñas nuevas se guardan hasheadas (empiezan con `$2a$`, `$2b$` o `$2y$`)
- [ ] El login funciona correctamente con usuarios existentes
- [ ] El login funciona correctamente con usuarios nuevos
- [ ] La migración masiva funciona correctamente
- [ ] Las contraseñas en texto plano se hashean automáticamente al hacer login

---

## 🔧 Solución de Problemas

### Si el login no funciona después del hashing:

1. Verifica que el usuario tenga contraseña en la BD
2. Verifica que la contraseña esté hasheada correctamente
3. Revisa los logs del backend para ver errores

### Si la migración falla:

1. Verifica que el usuario ADMIN existe y tiene el rol correcto
2. Verifica que la contraseña del ADMIN sea correcta
3. Revisa los logs para ver el error específico

### Si algunas contraseñas no se hashean:

1. Verifica que tengan contenido (no sean NULL o vacías)
2. Ejecuta la migración nuevamente (es idempotente)
3. Verifica que el usuario ADMIN tenga permisos

---

## 📝 Notas Importantes

- **Formato de hash**: Las contraseñas hasheadas con bcrypt siempre empiezan con `$2a$`, `$2b$` o `$2y$` y tienen aproximadamente 60 caracteres
- **Migración automática**: Las contraseñas en texto plano se hashean automáticamente cuando el usuario hace login
- **Seguridad**: Nunca muestres las contraseñas hasheadas completas en logs o pantallas
