-- Migração para corrigir a estrutura da tabela vehicles
-- Substituir campo 'type' por 'vehicle_type_id'

USE u824538998_gstock_db;

-- Primeiro, vamos verificar se há dados na tabela
SELECT COUNT(*) as total_vehicles FROM vehicles;

-- Se houver dados, vamos criar um backup temporário
CREATE TABLE vehicles_backup AS SELECT * FROM vehicles;

-- Adicionar a nova coluna vehicle_type_id
ALTER TABLE vehicles ADD COLUMN vehicle_type_id VARCHAR(36) AFTER vin;

-- Criar um tipo de veículo padrão se não existir
INSERT IGNORE INTO vehicle_types (id, name, description, category, is_active, created_at, updated_at)
VALUES ('default-vehicle-type-id', 'Veículo Comercial', 'Tipo padrão para veículos comerciais', 'commercial', 1, NOW(), NOW());

-- Atualizar todos os registros existentes para usar o tipo padrão
UPDATE vehicles SET vehicle_type_id = 'default-vehicle-type-id' WHERE vehicle_type_id IS NULL;

-- Tornar a coluna vehicle_type_id obrigatória
ALTER TABLE vehicles MODIFY COLUMN vehicle_type_id VARCHAR(36) NOT NULL;

-- Adicionar a chave estrangeira
ALTER TABLE vehicles ADD CONSTRAINT fk_vehicles_vehicle_type 
    FOREIGN KEY (vehicle_type_id) REFERENCES vehicle_types(id);

-- Remover a coluna 'type' antiga
ALTER TABLE vehicles DROP COLUMN type;

-- Verificar a estrutura final
DESCRIBE vehicles;

SELECT 'Migração concluída com sucesso!' as status;