CREATE TABLE `carriers` (
	`id` varchar(36) NOT NULL DEFAULT (UUID()),
	`name` varchar(255) NOT NULL,
	`code` varchar(50) NOT NULL,
	`type` varchar(50) NOT NULL DEFAULT 'external',
	`email` varchar(255),
	`phone` varchar(50),
	`address` text,
	`contact_person` varchar(255),
	`tax_id` varchar(50),
	`is_active` boolean NOT NULL DEFAULT true,
	`notes` text,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()),
	CONSTRAINT `carriers_id` PRIMARY KEY(`id`),
	CONSTRAINT `carriers_code_unique` UNIQUE(`code`)
);
--> statement-breakpoint
ALTER TABLE `vehicles` ADD `carrier_id` varchar(36) NOT NULL;--> statement-breakpoint
ALTER TABLE `vehicles` ADD CONSTRAINT `vehicles_carrier_id_carriers_id_fk` FOREIGN KEY (`carrier_id`) REFERENCES `carriers`(`id`) ON DELETE no action ON UPDATE no action;