-- Migração para criar tabelas de devoluções (returns)
-- Data: 2025-09-17

-- Tabela principal de devoluções
CREATE TABLE IF NOT EXISTS `returns` (
  `id` varchar(36) NOT NULL DEFAULT (UUID()),
  `return_number` varchar(100) NOT NULL UNIQUE,
  `order_number` varchar(100),
  `order_id` varchar(36),
  `type` varchar(50) NOT NULL DEFAULT 'customer',
  `customer_id` varchar(36),
  `customer_name` varchar(255),
  `customer_email` varchar(255),
  `customer_phone` varchar(50),
  `supplier_id` varchar(36),
  `status` varchar(50) NOT NULL DEFAULT 'pending',
  `priority` varchar(20) NOT NULL DEFAULT 'medium',
  `reason` text NOT NULL,
  `condition` varchar(50) DEFAULT 'used',
  `refund_method` varchar(50) DEFAULT 'cash',
  `total_amount` decimal(12,2) NOT NULL DEFAULT 0,
  `refund_amount` decimal(12,2),
  `notes` text,
  `inspection_notes` text,
  `user_id` varchar(36),
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `approved_at` timestamp NULL,
  `processed_at` timestamp NULL,
  `completed_at` timestamp NULL,
  PRIMARY KEY (`id`),
  KEY `idx_returns_return_number` (`return_number`),
  KEY `idx_returns_order_id` (`order_id`),
  KEY `idx_returns_customer_id` (`customer_id`),
  KEY `idx_returns_supplier_id` (`supplier_id`),
  KEY `idx_returns_user_id` (`user_id`),
  KEY `idx_returns_status` (`status`),
  KEY `idx_returns_type` (`type`),
  KEY `idx_returns_created_at` (`created_at`),
  CONSTRAINT `fk_returns_order_id` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_returns_customer_id` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_returns_supplier_id` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_returns_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela de itens de devolução
CREATE TABLE IF NOT EXISTS `return_items` (
  `id` varchar(36) NOT NULL DEFAULT (UUID()),
  `return_id` varchar(36) NOT NULL,
  `product_id` varchar(36) NOT NULL,
  `product_name` varchar(255) NOT NULL,
  `quantity` int NOT NULL,
  `unit_price` decimal(10,2) NOT NULL,
  `condition` varchar(50) NOT NULL DEFAULT 'used',
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_return_items_return_id` (`return_id`),
  KEY `idx_return_items_product_id` (`product_id`),
  CONSTRAINT `fk_return_items_return_id` FOREIGN KEY (`return_id`) REFERENCES `returns` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_return_items_product_id` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Inserir dados de exemplo (opcional)
-- INSERT INTO `returns` (`return_number`, `type`, `status`, `priority`, `reason`, `total_amount`, `user_id`) 
-- VALUES ('RET-2025-001', 'customer', 'pending', 'medium', 'Produto com defeito', 150.00, (SELECT id FROM users LIMIT 1));
