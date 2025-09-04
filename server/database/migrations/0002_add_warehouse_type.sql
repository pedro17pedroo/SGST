-- Adicionar campo type à tabela warehouses
ALTER TABLE `warehouses` ADD `type` varchar(50) DEFAULT 'local' NOT NULL;