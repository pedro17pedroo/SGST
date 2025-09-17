-- Migração 0007: Criar tabelas de packing
-- Data: 2025-09-17

-- Tabela de tarefas de embalagem
CREATE TABLE IF NOT EXISTS packing_tasks (
  id VARCHAR(36) PRIMARY KEY,
  picking_list_id VARCHAR(36) NOT NULL,
  package_type VARCHAR(100) NOT NULL,
  status ENUM('pending', 'in_progress', 'completed', 'cancelled') DEFAULT 'pending',
  target_weight DECIMAL(10,3),
  actual_weight DECIMAL(10,3),
  special_instructions TEXT,
  warehouse_id VARCHAR(36) NOT NULL,
  assigned_to VARCHAR(36),
  started_at TIMESTAMP NULL,
  completed_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_packing_tasks_picking_list (picking_list_id),
  INDEX idx_packing_tasks_status (status),
  INDEX idx_packing_tasks_warehouse (warehouse_id),
  INDEX idx_packing_tasks_assigned (assigned_to)
);

-- Inserir dados de exemplo para packing_tasks
INSERT IGNORE INTO packing_tasks (
  id, picking_list_id, package_type, status, target_weight, actual_weight,
  special_instructions, warehouse_id, assigned_to, started_at, completed_at, created_at
) VALUES
('pt-001', 'pl-001', 'Caixa Pequena', 'pending', 2.5, NULL, 'Embalar com cuidado - produtos frágeis', 'warehouse-1', NULL, NULL, NULL, NOW()),
('pt-002', 'pl-002', 'Caixa Média', 'in_progress', 5.0, 4.8, 'Produtos eletrônicos - usar material antiestático', 'warehouse-1', 'user-3', NOW(), NULL, DATE_SUB(NOW(), INTERVAL 30 MINUTE)),
('pt-003', 'pl-003', 'Caixa Grande', 'completed', 10.0, 9.7, 'Produtos pesados - reforçar embalagem', 'warehouse-1', 'user-2', DATE_SUB(NOW(), INTERVAL 2 HOUR), DATE_SUB(NOW(), INTERVAL 1 HOUR), DATE_SUB(NOW(), INTERVAL 3 HOUR)),
('pt-004', 'pl-004', 'Envelope', 'pending', 0.5, NULL, 'Documentos - não dobrar', 'warehouse-2', NULL, NULL, NULL, NOW());
