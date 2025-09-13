-- Migração para corrigir estrutura da tabela vehicles
-- Data: 2025-09-13
-- Descrição: Atualizar colunas type e fuel_type para vehicle_type_id e fuel_type_id

-- Passo 1: Adicionar as novas colunas
ALTER TABLE vehicles 
ADD COLUMN vehicle_type_id VARCHAR(36) AFTER vin;

ALTER TABLE vehicles 
ADD COLUMN fuel_type_id VARCHAR(36) AFTER capacity;

-- Passo 2: Mapear valores existentes para os novos IDs baseado nos dados das tabelas de referência
UPDATE vehicles v
JOIN vehicle_types vt ON (
    (LOWER(v.type) LIKE CONCAT('%', LOWER(vt.name), '%')) OR
    (LOWER(vt.name) LIKE CONCAT('%', LOWER(v.type), '%'))
)
SET v.vehicle_type_id = vt.id
WHERE v.vehicle_type_id IS NULL;

UPDATE vehicles v
JOIN fuel_types ft ON (
    (LOWER(v.fuel_type) LIKE CONCAT('%', LOWER(ft.name), '%')) OR
    (LOWER(ft.name) LIKE CONCAT('%', LOWER(v.fuel_type), '%'))
)
SET v.fuel_type_id = ft.id
WHERE v.fuel_type_id IS NULL;

-- Passo 3: Para registos que não foram mapeados, usar valores padrão
UPDATE vehicles 
SET vehicle_type_id = (SELECT id FROM vehicle_types LIMIT 1)
WHERE vehicle_type_id IS NULL;

UPDATE vehicles 
SET fuel_type_id = (SELECT id FROM fuel_types LIMIT 1)
WHERE fuel_type_id IS NULL;

-- Passo 4: Tornar as novas colunas NOT NULL
ALTER TABLE vehicles 
MODIFY COLUMN vehicle_type_id VARCHAR(36) NOT NULL;

ALTER TABLE vehicles 
MODIFY COLUMN fuel_type_id VARCHAR(36) NOT NULL;

-- Passo 5: Adicionar constraints de foreign key
ALTER TABLE vehicles 
ADD CONSTRAINT fk_vehicles_vehicle_type 
FOREIGN KEY (vehicle_type_id) REFERENCES vehicle_types(id);

ALTER TABLE vehicles 
ADD CONSTRAINT fk_vehicles_fuel_type 
FOREIGN KEY (fuel_type_id) REFERENCES fuel_types(id);

-- Passo 6: Remover as colunas antigas
ALTER TABLE vehicles 
DROP COLUMN type;

ALTER TABLE vehicles 
DROP COLUMN fuel_type;