# Migración de Contraseñas a Hash Bcrypt

Este script migra todas las contraseñas en texto plano de la base de datos a hash bcrypt para mejorar la seguridad.

## Opción 1: Usar el Script de Migración (Recomendado)

### Requisitos:
- Tener un usuario ADMIN en la base de datos
- Conocer el ID y la contraseña del administrador

### Ejecución:

```bash
npm run migrate:passwords <idAdmin> <claveAdmin>
```

### Ejemplo:

```bash
npm run migrate:passwords 1 miClaveAdmin123
```

Esto hasheará todas las contraseñas que aún estén en texto plano en la base de datos.

## Opción 2: Usar el Endpoint REST

Puedes hacer una petición POST al endpoint:

```
POST http://localhost:3001/usuarios/migrar-contraseñas
Content-Type: application/json

{
  "idAdmin": 1,
  "claveAdmin": "tu_clave_admin"
}
```

### Ejemplo con curl:

```bash
curl -X POST http://localhost:3001/usuarios/migrar-contraseñas \
  -H "Content-Type: application/json" \
  -d '{
    "idAdmin": 1,
    "claveAdmin": "miClaveAdmin123"
  }'
```

## Opción 3: Migración Automática

Las contraseñas se hashean automáticamente cuando:
- Un usuario hace login (si su contraseña aún está en texto plano)
- Se crea un nuevo usuario
- Se actualiza la contraseña de un usuario

## Notas Importantes:

1. **Seguridad**: El script solo puede ser ejecutado por un usuario ADMIN
2. **No destructivo**: El script solo hashea contraseñas que aún están en texto plano
3. **Idempotente**: Puedes ejecutarlo múltiples veces sin problemas
4. **Formato de hash**: Las contraseñas hasheadas tienen el formato `$2a$10$...` (60 caracteres)

## Verificación:

Después de ejecutar la migración, puedes verificar en la base de datos que las contraseñas tienen el formato de hash bcrypt (empiezan con `$2a$`, `$2b$` o `$2y$`).

```sql
SELECT id_usuarios, usuario, 
       CASE 
         WHEN clave LIKE '$2%' THEN 'Hasheada'
         ELSE 'Texto plano'
       END as estado
FROM usuarios;
```
