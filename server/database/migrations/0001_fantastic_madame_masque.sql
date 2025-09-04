CREATE TABLE `digital_twin_simulations` (
	`id` varchar(36) NOT NULL DEFAULT (UUID()),
	`warehouse_id` varchar(36) NOT NULL,
	`name` varchar(255) NOT NULL,
	`type` varchar(50) NOT NULL,
	`parameters` json,
	`results` json,
	`status` varchar(50) NOT NULL DEFAULT 'pending',
	`started_at` timestamp,
	`completed_at` timestamp,
	`user_id` varchar(36),
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `digital_twin_simulations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `picking_list_items` (
	`id` varchar(36) NOT NULL DEFAULT (UUID()),
	`picking_list_id` varchar(36) NOT NULL,
	`product_id` varchar(36) NOT NULL,
	`location_id` varchar(36),
	`quantity_to_pick` int NOT NULL,
	`quantity_picked` int DEFAULT 0,
	`status` varchar(50) NOT NULL DEFAULT 'pending',
	`picked_by` varchar(36),
	`picked_at` timestamp,
	`notes` text,
	`substituted_with` varchar(36),
	CONSTRAINT `picking_list_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `picking_lists` (
	`id` varchar(36) NOT NULL DEFAULT (UUID()),
	`pick_number` varchar(100) NOT NULL,
	`order_id` varchar(36),
	`warehouse_id` varchar(36) NOT NULL,
	`status` varchar(50) NOT NULL DEFAULT 'pending',
	`priority` varchar(20) NOT NULL DEFAULT 'normal',
	`assigned_to` varchar(36),
	`type` varchar(50) NOT NULL DEFAULT 'individual',
	`scheduled_date` timestamp,
	`started_at` timestamp,
	`completed_at` timestamp,
	`estimated_time` int,
	`actual_time` int,
	`notes` text,
	`user_id` varchar(36),
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `picking_lists_id` PRIMARY KEY(`id`),
	CONSTRAINT `picking_lists_pick_number_unique` UNIQUE(`pick_number`)
);
--> statement-breakpoint
CREATE TABLE `real_time_visualization` (
	`id` varchar(36) NOT NULL DEFAULT (UUID()),
	`warehouse_id` varchar(36) NOT NULL,
	`entity_type` varchar(50) NOT NULL,
	`entity_id` varchar(36) NOT NULL,
	`position` json,
	`status` varchar(50) NOT NULL,
	`metadata` json,
	`timestamp` timestamp DEFAULT (now()),
	`is_active` boolean NOT NULL DEFAULT true,
	CONSTRAINT `real_time_visualization_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `warehouse_layout` (
	`id` varchar(36) NOT NULL DEFAULT (UUID()),
	`warehouse_id` varchar(36) NOT NULL,
	`name` varchar(255) NOT NULL,
	`version` varchar(50) NOT NULL,
	`layout_data` json,
	`metadata` json,
	`is_active` boolean NOT NULL DEFAULT true,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()),
	CONSTRAINT `warehouse_layout_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `warehouse_zones` (
	`id` varchar(36) NOT NULL DEFAULT (UUID()),
	`warehouse_id` varchar(36) NOT NULL,
	`name` varchar(255) NOT NULL,
	`type` varchar(50) NOT NULL,
	`coordinates` json,
	`capacity` json,
	`current_utilization` json,
	`is_active` boolean NOT NULL DEFAULT true,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()),
	CONSTRAINT `warehouse_zones_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `digital_twin_simulations` ADD CONSTRAINT `digital_twin_simulations_warehouse_id_warehouses_id_fk` FOREIGN KEY (`warehouse_id`) REFERENCES `warehouses`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `digital_twin_simulations` ADD CONSTRAINT `digital_twin_simulations_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `picking_list_items` ADD CONSTRAINT `picking_list_items_picking_list_id_picking_lists_id_fk` FOREIGN KEY (`picking_list_id`) REFERENCES `picking_lists`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `picking_list_items` ADD CONSTRAINT `picking_list_items_product_id_products_id_fk` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `picking_list_items` ADD CONSTRAINT `picking_list_items_location_id_product_locations_id_fk` FOREIGN KEY (`location_id`) REFERENCES `product_locations`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `picking_list_items` ADD CONSTRAINT `picking_list_items_picked_by_users_id_fk` FOREIGN KEY (`picked_by`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `picking_list_items` ADD CONSTRAINT `picking_list_items_substituted_with_products_id_fk` FOREIGN KEY (`substituted_with`) REFERENCES `products`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `picking_lists` ADD CONSTRAINT `picking_lists_order_id_orders_id_fk` FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `picking_lists` ADD CONSTRAINT `picking_lists_warehouse_id_warehouses_id_fk` FOREIGN KEY (`warehouse_id`) REFERENCES `warehouses`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `picking_lists` ADD CONSTRAINT `picking_lists_assigned_to_users_id_fk` FOREIGN KEY (`assigned_to`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `picking_lists` ADD CONSTRAINT `picking_lists_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `real_time_visualization` ADD CONSTRAINT `real_time_visualization_warehouse_id_warehouses_id_fk` FOREIGN KEY (`warehouse_id`) REFERENCES `warehouses`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `warehouse_layout` ADD CONSTRAINT `warehouse_layout_warehouse_id_warehouses_id_fk` FOREIGN KEY (`warehouse_id`) REFERENCES `warehouses`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `warehouse_zones` ADD CONSTRAINT `warehouse_zones_warehouse_id_warehouses_id_fk` FOREIGN KEY (`warehouse_id`) REFERENCES `warehouses`(`id`) ON DELETE no action ON UPDATE no action;