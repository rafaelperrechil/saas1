-- Corrigir registros com updated_at inválido
UPDATE users 
SET updated_at = NOW() 
WHERE updated_at IS NULL 
   OR updated_at = '0000-00-00 00:00:00' 
   OR updated_at = '0000-00-00' 
   OR updated_at = '1970-01-01 00:00:00';

-- Corrigir registros com created_at inválido
UPDATE users 
SET created_at = NOW() 
WHERE created_at IS NULL 
   OR created_at = '0000-00-00 00:00:00' 
   OR created_at = '0000-00-00' 
   OR created_at = '1970-01-01 00:00:00'; 