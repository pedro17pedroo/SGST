CREATE TABLE `barcode_scans` (
	`id` varchar(36) NOT NULL DEFAULT (UUID()),
	`scanned_code` varchar(255) NOT NULL,
	`scan_type` varchar(50) NOT NULL,
	`product_id` varchar(36),
	`warehouse_id` varchar(36),
	`location_id` varchar(36),
	`scan_purpose` varchar(100) NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`metadata` json,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `barcode_scans_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `categories` (
	`id` varchar(36) NOT NULL DEFAULT (UUID()),
	`name` varchar(255) NOT NULL,
	`description` text,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `categories_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `customers` (
	`id` varchar(36) NOT NULL DEFAULT (UUID()),
	`customer_number` varchar(100) NOT NULL,
	`name` varchar(255) NOT NULL,
	`email` varchar(255),
	`phone` varchar(50),
	`mobile` varchar(50),
	`address` text,
	`city` varchar(100),
	`province` varchar(100),
	`postal_code` varchar(20),
	`country` varchar(100) DEFAULT 'Angola',
	`tax_number` varchar(50),
	`customer_type` varchar(50) NOT NULL DEFAULT 'individual',
	`credit_limit` decimal(12,2) DEFAULT '0',
	`payment_terms` varchar(50) DEFAULT 'cash',
	`discount` decimal(5,2) DEFAULT '0',
	`is_active` boolean NOT NULL DEFAULT true,
	`notes` text,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()),
	CONSTRAINT `customers_id` PRIMARY KEY(`id`),
	CONSTRAINT `customers_customer_number_unique` UNIQUE(`customer_number`)
);
--> statement-breakpoint
CREATE TABLE `geofence_alerts` (
	`id` varchar(36) NOT NULL DEFAULT (UUID()),
	`vehicle_id` varchar(36) NOT NULL,
	`geofence_id` varchar(36) NOT NULL,
	`driver_id` varchar(36),
	`assignment_id` varchar(36),
	`alert_type` varchar(50) NOT NULL,
	`location` json NOT NULL,
	`is_acknowledged` boolean NOT NULL DEFAULT false,
	`acknowledged_by` varchar(36),
	`acknowledged_at` timestamp,
	`severity` varchar(20) NOT NULL DEFAULT 'medium',
	`message` text,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `geofence_alerts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `geofences` (
	`id` varchar(36) NOT NULL DEFAULT (UUID()),
	`name` varchar(255) NOT NULL,
	`description` text,
	`type` varchar(50) NOT NULL,
	`coordinates` json NOT NULL,
	`warehouse_id` varchar(36),
	`is_active` boolean NOT NULL DEFAULT true,
	`created_by` varchar(36),
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `geofences_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `gps_sessions` (
	`id` varchar(36) NOT NULL DEFAULT (UUID()),
	`user_id` varchar(36) NOT NULL,
	`vehicle_id` varchar(36),
	`session_type` varchar(50) NOT NULL,
	`start_location` json,
	`end_location` json,
	`total_distance` decimal(8,2),
	`total_duration` int,
	`status` varchar(50) NOT NULL DEFAULT 'active',
	`notes` text,
	`started_at` timestamp DEFAULT (now()),
	`ended_at` timestamp,
	CONSTRAINT `gps_sessions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `gps_tracking` (
	`id` varchar(36) NOT NULL DEFAULT (UUID()),
	`vehicle_id` varchar(36) NOT NULL,
	`latitude` decimal(10,8) NOT NULL,
	`longitude` decimal(11,8) NOT NULL,
	`speed` decimal(5,2),
	`heading` decimal(5,2),
	`altitude` decimal(8,2),
	`accuracy` decimal(5,2),
	`timestamp` timestamp DEFAULT (now()),
	`user_id` varchar(36),
	`metadata` json,
	CONSTRAINT `gps_tracking_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `inventory` (
	`id` varchar(36) NOT NULL DEFAULT (UUID()),
	`product_id` varchar(36) NOT NULL,
	`warehouse_id` varchar(36) NOT NULL,
	`quantity` int NOT NULL DEFAULT 0,
	`reserved_quantity` int NOT NULL DEFAULT 0,
	`last_updated` timestamp DEFAULT (now()),
	CONSTRAINT `inventory_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `inventory_count_items` (
	`id` varchar(36) NOT NULL DEFAULT (UUID()),
	`count_id` varchar(36) NOT NULL,
	`product_id` varchar(36) NOT NULL,
	`expected_quantity` int NOT NULL,
	`counted_quantity` int,
	`variance` int,
	`reconciled` boolean NOT NULL DEFAULT false,
	`counted_by_user_id` varchar(36),
	`counted_at` timestamp,
	CONSTRAINT `inventory_count_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `inventory_counts` (
	`id` varchar(36) NOT NULL DEFAULT (UUID()),
	`count_number` varchar(100) NOT NULL,
	`type` varchar(50) NOT NULL,
	`status` varchar(50) NOT NULL DEFAULT 'pending',
	`warehouse_id` varchar(36) NOT NULL,
	`scheduled_date` timestamp,
	`completed_date` timestamp,
	`user_id` varchar(36),
	`notes` text,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `inventory_counts_id` PRIMARY KEY(`id`),
	CONSTRAINT `inventory_counts_count_number_unique` UNIQUE(`count_number`)
);
--> statement-breakpoint
CREATE TABLE `order_items` (
	`id` varchar(36) NOT NULL DEFAULT (UUID()),
	`order_id` varchar(36) NOT NULL,
	`product_id` varchar(36) NOT NULL,
	`quantity` int NOT NULL,
	`unit_price` decimal(10,2) NOT NULL,
	`total_price` decimal(12,2) NOT NULL,
	CONSTRAINT `order_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `orders` (
	`id` varchar(36) NOT NULL DEFAULT (UUID()),
	`order_number` varchar(100) NOT NULL,
	`type` varchar(50) NOT NULL,
	`status` varchar(50) NOT NULL DEFAULT 'pending',
	`customer_id` varchar(36),
	`customer_name` varchar(255),
	`customer_email` varchar(255),
	`customer_phone` varchar(50),
	`customer_address` text,
	`supplier_id` varchar(36),
	`total_amount` decimal(12,2),
	`notes` text,
	`user_id` varchar(36),
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `orders_id` PRIMARY KEY(`id`),
	CONSTRAINT `orders_order_number_unique` UNIQUE(`order_number`)
);
--> statement-breakpoint
CREATE TABLE `permissions` (
	`id` varchar(36) NOT NULL DEFAULT (UUID()),
	`name` varchar(100) NOT NULL,
	`description` text,
	`module` varchar(50) NOT NULL,
	`action` varchar(50) NOT NULL,
	`resource` varchar(50),
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `permissions_id` PRIMARY KEY(`id`),
	CONSTRAINT `permissions_name_unique` UNIQUE(`name`)
);
--> statement-breakpoint
CREATE TABLE `product_locations` (
	`id` varchar(36) NOT NULL DEFAULT (UUID()),
	`product_id` varchar(36) NOT NULL,
	`warehouse_id` varchar(36) NOT NULL,
	`zone` varchar(50),
	`shelf` varchar(50),
	`bin` varchar(50),
	`last_scanned` timestamp,
	`scanned_by_user_id` varchar(36),
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `product_locations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `products` (
	`id` varchar(36) NOT NULL DEFAULT (UUID()),
	`name` varchar(255) NOT NULL,
	`description` text,
	`sku` varchar(100) NOT NULL,
	`barcode` varchar(100),
	`price` decimal(10,2) NOT NULL,
	`weight` decimal(8,3),
	`dimensions` json,
	`category_id` varchar(36),
	`supplier_id` varchar(36),
	`min_stock_level` int DEFAULT 0,
	`is_active` boolean NOT NULL DEFAULT true,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `products_id` PRIMARY KEY(`id`),
	CONSTRAINT `products_sku_unique` UNIQUE(`sku`)
);
--> statement-breakpoint
CREATE TABLE `role_permissions` (
	`id` varchar(36) NOT NULL DEFAULT (UUID()),
	`role_id` varchar(36) NOT NULL,
	`permission_id` varchar(36) NOT NULL,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `role_permissions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `roles` (
	`id` varchar(36) NOT NULL DEFAULT (UUID()),
	`name` varchar(100) NOT NULL,
	`description` text,
	`is_active` boolean NOT NULL DEFAULT true,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()),
	CONSTRAINT `roles_id` PRIMARY KEY(`id`),
	CONSTRAINT `roles_name_unique` UNIQUE(`name`)
);
--> statement-breakpoint
CREATE TABLE `shipments` (
	`id` varchar(36) NOT NULL DEFAULT (UUID()),
	`shipment_number` varchar(100) NOT NULL,
	`order_id` varchar(36),
	`vehicle_id` varchar(36),
	`status` varchar(50) NOT NULL DEFAULT 'preparing',
	`carrier` varchar(255),
	`tracking_number` varchar(255),
	`shipping_address` text,
	`estimated_delivery` timestamp,
	`actual_delivery` timestamp,
	`user_id` varchar(36),
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `shipments_id` PRIMARY KEY(`id`),
	CONSTRAINT `shipments_shipment_number_unique` UNIQUE(`shipment_number`)
);
--> statement-breakpoint
CREATE TABLE `stock_movements` (
	`id` varchar(36) NOT NULL DEFAULT (UUID()),
	`product_id` varchar(36) NOT NULL,
	`warehouse_id` varchar(36) NOT NULL,
	`type` varchar(50) NOT NULL,
	`quantity` int NOT NULL,
	`reference` varchar(255),
	`reason` text,
	`user_id` varchar(36),
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `stock_movements_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `suppliers` (
	`id` varchar(36) NOT NULL DEFAULT (UUID()),
	`name` varchar(255) NOT NULL,
	`email` varchar(255),
	`phone` varchar(50),
	`address` text,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `suppliers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user_roles` (
	`id` varchar(36) NOT NULL DEFAULT (UUID()),
	`user_id` varchar(36) NOT NULL,
	`role_id` varchar(36) NOT NULL,
	`assigned_by` varchar(36),
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `user_roles_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` varchar(36) NOT NULL DEFAULT (UUID()),
	`username` varchar(255) NOT NULL,
	`email` varchar(255) NOT NULL,
	`password` text NOT NULL,
	`role` varchar(50) NOT NULL DEFAULT 'operator',
	`is_active` boolean NOT NULL DEFAULT true,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_username_unique` UNIQUE(`username`),
	CONSTRAINT `users_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE TABLE `vehicle_assignments` (
	`id` varchar(36) NOT NULL DEFAULT (UUID()),
	`vehicle_id` varchar(36) NOT NULL,
	`order_id` varchar(36),
	`shipment_id` varchar(36),
	`driver_id` varchar(36) NOT NULL,
	`status` varchar(50) NOT NULL DEFAULT 'assigned',
	`assigned_by` varchar(36),
	`start_location` json,
	`end_location` json,
	`estimated_duration` int,
	`actual_duration` int,
	`notes` text,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()),
	CONSTRAINT `vehicle_assignments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `vehicle_maintenance` (
	`id` varchar(36) NOT NULL DEFAULT (UUID()),
	`vehicle_id` varchar(36) NOT NULL,
	`type` varchar(50) NOT NULL,
	`description` text NOT NULL,
	`cost` decimal(10,2),
	`performed_by` varchar(36),
	`scheduled_date` timestamp,
	`completed_date` timestamp,
	`status` varchar(50) NOT NULL DEFAULT 'scheduled',
	`notes` text,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `vehicle_maintenance_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `vehicles` (
	`id` varchar(36) NOT NULL DEFAULT (UUID()),
	`license_plate` varchar(20) NOT NULL,
	`make` varchar(100) NOT NULL,
	`model` varchar(100) NOT NULL,
	`year` int NOT NULL,
	`vin` varchar(50),
	`type` varchar(50) NOT NULL,
	`capacity` decimal(8,2),
	`fuel_type` varchar(50) DEFAULT 'gasoline',
	`status` varchar(50) NOT NULL DEFAULT 'available',
	`driver_id` varchar(36),
	`current_location` json,
	`last_gps_update` timestamp,
	`is_active` boolean NOT NULL DEFAULT true,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()),
	CONSTRAINT `vehicles_id` PRIMARY KEY(`id`),
	CONSTRAINT `vehicles_license_plate_unique` UNIQUE(`license_plate`)
);
--> statement-breakpoint
CREATE TABLE `warehouses` (
	`id` varchar(36) NOT NULL DEFAULT (UUID()),
	`name` varchar(255) NOT NULL,
	`address` text,
	`is_active` boolean NOT NULL DEFAULT true,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `warehouses_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `barcode_scans` ADD CONSTRAINT `barcode_scans_product_id_products_id_fk` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `barcode_scans` ADD CONSTRAINT `barcode_scans_warehouse_id_warehouses_id_fk` FOREIGN KEY (`warehouse_id`) REFERENCES `warehouses`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `barcode_scans` ADD CONSTRAINT `barcode_scans_location_id_product_locations_id_fk` FOREIGN KEY (`location_id`) REFERENCES `product_locations`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `barcode_scans` ADD CONSTRAINT `barcode_scans_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `geofence_alerts` ADD CONSTRAINT `geofence_alerts_vehicle_id_vehicles_id_fk` FOREIGN KEY (`vehicle_id`) REFERENCES `vehicles`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `geofence_alerts` ADD CONSTRAINT `geofence_alerts_geofence_id_geofences_id_fk` FOREIGN KEY (`geofence_id`) REFERENCES `geofences`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `geofence_alerts` ADD CONSTRAINT `geofence_alerts_driver_id_users_id_fk` FOREIGN KEY (`driver_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `geofence_alerts` ADD CONSTRAINT `geofence_alerts_assignment_id_vehicle_assignments_id_fk` FOREIGN KEY (`assignment_id`) REFERENCES `vehicle_assignments`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `geofence_alerts` ADD CONSTRAINT `geofence_alerts_acknowledged_by_users_id_fk` FOREIGN KEY (`acknowledged_by`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `geofences` ADD CONSTRAINT `geofences_warehouse_id_warehouses_id_fk` FOREIGN KEY (`warehouse_id`) REFERENCES `warehouses`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `geofences` ADD CONSTRAINT `geofences_created_by_users_id_fk` FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `gps_sessions` ADD CONSTRAINT `gps_sessions_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `gps_sessions` ADD CONSTRAINT `gps_sessions_vehicle_id_vehicles_id_fk` FOREIGN KEY (`vehicle_id`) REFERENCES `vehicles`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `gps_tracking` ADD CONSTRAINT `gps_tracking_vehicle_id_vehicles_id_fk` FOREIGN KEY (`vehicle_id`) REFERENCES `vehicles`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `gps_tracking` ADD CONSTRAINT `gps_tracking_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `inventory` ADD CONSTRAINT `inventory_product_id_products_id_fk` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `inventory` ADD CONSTRAINT `inventory_warehouse_id_warehouses_id_fk` FOREIGN KEY (`warehouse_id`) REFERENCES `warehouses`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `inventory_count_items` ADD CONSTRAINT `inventory_count_items_count_id_inventory_counts_id_fk` FOREIGN KEY (`count_id`) REFERENCES `inventory_counts`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `inventory_count_items` ADD CONSTRAINT `inventory_count_items_product_id_products_id_fk` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `inventory_count_items` ADD CONSTRAINT `inventory_count_items_counted_by_user_id_users_id_fk` FOREIGN KEY (`counted_by_user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `inventory_counts` ADD CONSTRAINT `inventory_counts_warehouse_id_warehouses_id_fk` FOREIGN KEY (`warehouse_id`) REFERENCES `warehouses`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `inventory_counts` ADD CONSTRAINT `inventory_counts_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `order_items` ADD CONSTRAINT `order_items_order_id_orders_id_fk` FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `order_items` ADD CONSTRAINT `order_items_product_id_products_id_fk` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `orders` ADD CONSTRAINT `orders_customer_id_customers_id_fk` FOREIGN KEY (`customer_id`) REFERENCES `customers`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `orders` ADD CONSTRAINT `orders_supplier_id_suppliers_id_fk` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `orders` ADD CONSTRAINT `orders_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `product_locations` ADD CONSTRAINT `product_locations_product_id_products_id_fk` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `product_locations` ADD CONSTRAINT `product_locations_warehouse_id_warehouses_id_fk` FOREIGN KEY (`warehouse_id`) REFERENCES `warehouses`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `product_locations` ADD CONSTRAINT `product_locations_scanned_by_user_id_users_id_fk` FOREIGN KEY (`scanned_by_user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `products` ADD CONSTRAINT `products_category_id_categories_id_fk` FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `products` ADD CONSTRAINT `products_supplier_id_suppliers_id_fk` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `role_permissions` ADD CONSTRAINT `role_permissions_role_id_roles_id_fk` FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `role_permissions` ADD CONSTRAINT `role_permissions_permission_id_permissions_id_fk` FOREIGN KEY (`permission_id`) REFERENCES `permissions`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `shipments` ADD CONSTRAINT `shipments_order_id_orders_id_fk` FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `shipments` ADD CONSTRAINT `shipments_vehicle_id_vehicles_id_fk` FOREIGN KEY (`vehicle_id`) REFERENCES `vehicles`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `shipments` ADD CONSTRAINT `shipments_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `stock_movements` ADD CONSTRAINT `stock_movements_product_id_products_id_fk` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `stock_movements` ADD CONSTRAINT `stock_movements_warehouse_id_warehouses_id_fk` FOREIGN KEY (`warehouse_id`) REFERENCES `warehouses`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `stock_movements` ADD CONSTRAINT `stock_movements_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `user_roles` ADD CONSTRAINT `user_roles_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `user_roles` ADD CONSTRAINT `user_roles_role_id_roles_id_fk` FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `user_roles` ADD CONSTRAINT `user_roles_assigned_by_users_id_fk` FOREIGN KEY (`assigned_by`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `vehicle_assignments` ADD CONSTRAINT `vehicle_assignments_vehicle_id_vehicles_id_fk` FOREIGN KEY (`vehicle_id`) REFERENCES `vehicles`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `vehicle_assignments` ADD CONSTRAINT `vehicle_assignments_order_id_orders_id_fk` FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `vehicle_assignments` ADD CONSTRAINT `vehicle_assignments_shipment_id_shipments_id_fk` FOREIGN KEY (`shipment_id`) REFERENCES `shipments`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `vehicle_assignments` ADD CONSTRAINT `vehicle_assignments_driver_id_users_id_fk` FOREIGN KEY (`driver_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `vehicle_assignments` ADD CONSTRAINT `vehicle_assignments_assigned_by_users_id_fk` FOREIGN KEY (`assigned_by`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `vehicle_maintenance` ADD CONSTRAINT `vehicle_maintenance_vehicle_id_vehicles_id_fk` FOREIGN KEY (`vehicle_id`) REFERENCES `vehicles`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `vehicle_maintenance` ADD CONSTRAINT `vehicle_maintenance_performed_by_users_id_fk` FOREIGN KEY (`performed_by`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `vehicles` ADD CONSTRAINT `vehicles_driver_id_users_id_fk` FOREIGN KEY (`driver_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;