-- Script para cambiar el tipo de la columna 'clave' de INTEGER a VARCHAR
-- Esto es necesario para poder almacenar contraseñas hasheadas con bcrypt

-- IMPORTANTE: Ejecuta este script en tu base de datos PostgreSQL

-- Paso 1: Cambiar el tipo de columna a VARCHAR(255)
ALTER TABLE usuarios 
ALTER COLUMN clave TYPE VARCHAR(255) 
USING CASE 
  WHEN clave IS NULL THEN NULL
  ELSE clave::text
END;

-- Paso 2: Verificar que el cambio se aplicó correctamente
SELECT 
  column_name, 
  data_type, 
  character_maximum_length
FROM information_schema.columns
WHERE table_name = 'usuarios' 
  AND column_name = 'clave';

-- Paso 3: Verificar que las contraseñas existentes siguen ahí (si las hay)
SELECT id_usuarios, usuario, 
       CASE 
         WHEN clave IS NULL OR clave = '' THEN 'Sin contraseña'
         WHEN clave LIKE '$2%' THEN 'Hasheada'
         ELSE 'Texto plano'
       END as estado_contraseña,
       LENGTH(clave) as longitud
FROM usuarios
LIMIT 10;
