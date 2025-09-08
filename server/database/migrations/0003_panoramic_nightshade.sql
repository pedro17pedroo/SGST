CREATE TABLE `batches` (
	`id` varchar(36) NOT NULL DEFAULT (UUID()),
	`batch_number` varchar(100) NOT NULL,
	`product_id` varchar(36) NOT NULL,
	`warehouse_id` varchar(36) NOT NULL,
	`manufacturing_date` timestamp NOT NULL,
	`expiry_date` timestamp NOT NULL,
	`quantity` int NOT NULL DEFAULT 0,
	`remaining_quantity` int NOT NULL DEFAULT 0,
	`supplier_batch_ref` varchar(100),
	`quality_status` varchar(50) NOT NULL DEFAULT 'pending',
	`status` varchar(50) NOT NULL DEFAULT 'active',
	`notes` text,
	`fifo_position` int NOT NULL DEFAULT 0,
	`location` varchar(100),
	`user_id` varchar(36),
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()),
	CONSTRAINT `batches_id` PRIMARY KEY(`id`),
	CONSTRAINT `batches_batch_number_unique` UNIQUE(`batch_number`)
);
--> statement-breakpoint
ALTER TABLE `categories` ADD `is_active` boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE `batches` ADD CONSTRAINT `batches_product_id_products_id_fk` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `batches` ADD CONSTRAINT `batches_warehouse_id_warehouses_id_fk` FOREIGN KEY (`warehouse_id`) REFERENCES `warehouses`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `batches` ADD CONSTRAINT `batches_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;