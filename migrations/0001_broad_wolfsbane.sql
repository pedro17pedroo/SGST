CREATE TABLE "asn" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"asn_number" varchar(100) NOT NULL,
	"supplier_id" uuid NOT NULL,
	"warehouse_id" uuid NOT NULL,
	"po_number" varchar(100),
	"status" varchar(50) DEFAULT 'pending' NOT NULL,
	"transport_mode" varchar(50),
	"carrier" varchar(255),
	"tracking_number" varchar(255),
	"estimated_arrival" timestamp,
	"actual_arrival" timestamp,
	"edi_data" json,
	"container_numbers" json,
	"seal_numbers" json,
	"total_weight" numeric(10, 3),
	"total_volume" numeric(10, 3),
	"document_url" varchar(500),
	"notes" text,
	"user_id" uuid,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "asn_asn_number_unique" UNIQUE("asn_number")
);
--> statement-breakpoint
CREATE TABLE "asn_line_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"asn_id" uuid NOT NULL,
	"product_id" uuid NOT NULL,
	"expected_quantity" integer NOT NULL,
	"unit_of_measure" varchar(20) DEFAULT 'EA' NOT NULL,
	"lot_number" varchar(100),
	"expiry_date" timestamp,
	"serial_numbers" json,
	"pallet_id" varchar(100),
	"packaging" varchar(50),
	"expected_weight" numeric(8, 3),
	"expected_dimensions" json,
	"notes" text
);
--> statement-breakpoint
CREATE TABLE "audit_trail" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"table_name" varchar(255) NOT NULL,
	"record_id" varchar(255) NOT NULL,
	"operation" varchar(50) NOT NULL,
	"old_values" json,
	"new_values" json,
	"user_id" uuid,
	"timestamp" timestamp DEFAULT now() NOT NULL,
	"ip_address" varchar(45),
	"user_agent" text,
	"checksum" varchar(64) NOT NULL,
	"previous_hash" varchar(64),
	"signature" text,
	"worm_stored" boolean DEFAULT false,
	"blockchain_hash" varchar(64)
);
--> statement-breakpoint
CREATE TABLE "cv_counting_results" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" varchar(100) NOT NULL,
	"image_url" varchar(500),
	"video_url" varchar(500),
	"product_id" uuid,
	"detected_count" integer NOT NULL,
	"confidence" numeric(5, 4),
	"algorithm" varchar(50),
	"bounding_boxes" json,
	"dimensions" json,
	"weight" numeric(8, 3),
	"damage" json,
	"manual_verification" boolean DEFAULT false NOT NULL,
	"manual_count" integer,
	"verified_by" uuid,
	"status" varchar(50) DEFAULT 'pending' NOT NULL,
	"metadata" json,
	"processing_time" integer,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "demand_forecasts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" uuid NOT NULL,
	"warehouse_id" uuid NOT NULL,
	"forecast_date" timestamp NOT NULL,
	"forecast_period" varchar(20) NOT NULL,
	"predicted_demand" numeric(10, 2) NOT NULL,
	"confidence" numeric(5, 4),
	"actual_demand" numeric(10, 2),
	"accuracy" numeric(5, 4),
	"model_version" varchar(50),
	"algorithm" varchar(50),
	"features" json,
	"metadata" json,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "digital_twin_simulations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"warehouse_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"type" varchar(50) NOT NULL,
	"parameters" json,
	"results" json,
	"status" varchar(50) DEFAULT 'pending' NOT NULL,
	"started_at" timestamp,
	"completed_at" timestamp,
	"created_by" uuid,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "fraud_detection" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"alert_type" varchar(100) NOT NULL,
	"severity" varchar(20) NOT NULL,
	"description" text NOT NULL,
	"entity_type" varchar(50) NOT NULL,
	"entity_id" varchar(255) NOT NULL,
	"risk_score" numeric(5, 2),
	"evidence_data" json,
	"status" varchar(50) DEFAULT 'pending',
	"investigated_by" uuid,
	"resolution" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ml_models" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"model_name" varchar(255) NOT NULL,
	"model_type" varchar(100) NOT NULL,
	"version" varchar(50) NOT NULL,
	"parameters" json,
	"training_data" json,
	"accuracy" numeric(5, 4),
	"status" varchar(50) DEFAULT 'training',
	"last_training" timestamp,
	"deployed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "optimization_jobs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"job_type" varchar(100) NOT NULL,
	"warehouse_id" uuid,
	"parameters" json,
	"results" json,
	"status" varchar(50) DEFAULT 'pending',
	"started_at" timestamp,
	"completed_at" timestamp,
	"execution_time" integer,
	"improvement_metrics" json,
	"created_by" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pallet_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"pallet_id" uuid NOT NULL,
	"product_id" uuid NOT NULL,
	"quantity" integer NOT NULL,
	"lot_number" varchar(100),
	"expiry_date" timestamp,
	"serial_numbers" json,
	"weight" numeric(8, 3),
	"dimensions" json,
	"position" json,
	"added_at" timestamp DEFAULT now(),
	"added_by" uuid
);
--> statement-breakpoint
CREATE TABLE "picking_velocity" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" uuid NOT NULL,
	"warehouse_id" uuid NOT NULL,
	"location_id" uuid,
	"date" timestamp NOT NULL,
	"period" varchar(20) NOT NULL,
	"total_picked" integer DEFAULT 0 NOT NULL,
	"picking_events" integer DEFAULT 0 NOT NULL,
	"average_pick_time" numeric(8, 2),
	"peak_hour" integer,
	"velocity_score" numeric(8, 4),
	"abc_class" varchar(1),
	"trend_direction" varchar(10),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "product_affinity" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_a" uuid NOT NULL,
	"product_b" uuid NOT NULL,
	"affinity_score" numeric(5, 2) NOT NULL,
	"co_occurrence_count" integer DEFAULT 0,
	"last_calculated" timestamp DEFAULT now() NOT NULL,
	"confidence" numeric(5, 2)
);
--> statement-breakpoint
CREATE TABLE "putaway_rules" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"priority" integer DEFAULT 1 NOT NULL,
	"warehouse_id" uuid NOT NULL,
	"product_criteria" json,
	"location_criteria" json,
	"strategy" varchar(50) NOT NULL,
	"cross_dock_eligible" boolean DEFAULT false NOT NULL,
	"cross_dock_criteria" json,
	"max_capacity_utilization" numeric(5, 4) DEFAULT '0.8500',
	"is_active" boolean DEFAULT true NOT NULL,
	"effective_from" timestamp DEFAULT now(),
	"effective_to" timestamp,
	"user_id" uuid,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "putaway_tasks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"task_number" varchar(100) NOT NULL,
	"receipt_item_id" uuid NOT NULL,
	"product_id" uuid NOT NULL,
	"warehouse_id" uuid NOT NULL,
	"quantity" integer NOT NULL,
	"suggested_location_id" uuid,
	"actual_location_id" uuid,
	"rule_applied" uuid,
	"status" varchar(50) DEFAULT 'pending' NOT NULL,
	"priority" varchar(20) DEFAULT 'medium' NOT NULL,
	"assigned_to" uuid,
	"is_cross_dock" boolean DEFAULT false NOT NULL,
	"cross_dock_order" uuid,
	"started_at" timestamp,
	"completed_at" timestamp,
	"travel_distance" numeric(8, 2),
	"estimated_time" integer,
	"actual_time" integer,
	"notes" text,
	"user_id" uuid,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "putaway_tasks_task_number_unique" UNIQUE("task_number")
);
--> statement-breakpoint
CREATE TABLE "real_time_visualization" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"warehouse_id" uuid NOT NULL,
	"entity_type" varchar(50) NOT NULL,
	"entity_id" varchar(255) NOT NULL,
	"position" json,
	"status" varchar(50) NOT NULL,
	"metadata" json,
	"timestamp" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "receiving_receipt_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"receipt_id" uuid NOT NULL,
	"asn_line_item_id" uuid,
	"product_id" uuid NOT NULL,
	"expected_quantity" integer NOT NULL,
	"received_quantity" integer NOT NULL,
	"variance" integer,
	"variance_reason" varchar(255),
	"condition" varchar(50) DEFAULT 'good' NOT NULL,
	"lot_number" varchar(100),
	"expiry_date" timestamp,
	"serial_numbers" json,
	"actual_weight" numeric(8, 3),
	"actual_dimensions" json,
	"location_id" uuid,
	"cv_counting_id" uuid,
	"scanned_codes" json,
	"quality_notes" text,
	"received_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "receiving_receipts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"receipt_number" varchar(100) NOT NULL,
	"asn_id" uuid,
	"order_id" uuid,
	"warehouse_id" uuid NOT NULL,
	"status" varchar(50) DEFAULT 'receiving' NOT NULL,
	"receiving_method" varchar(50) NOT NULL,
	"total_expected" integer,
	"total_received" integer DEFAULT 0 NOT NULL,
	"discrepancies" integer DEFAULT 0 NOT NULL,
	"damage_reported" boolean DEFAULT false NOT NULL,
	"quality_inspection" json,
	"received_by" uuid NOT NULL,
	"supervisor_approval" uuid,
	"started_at" timestamp DEFAULT now(),
	"completed_at" timestamp,
	"notes" text,
	CONSTRAINT "receiving_receipts_receipt_number_unique" UNIQUE("receipt_number")
);
--> statement-breakpoint
CREATE TABLE "replenishment_rules" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"product_id" uuid NOT NULL,
	"warehouse_id" uuid NOT NULL,
	"location_id" uuid,
	"strategy" varchar(50) NOT NULL,
	"min_level" integer NOT NULL,
	"max_level" integer NOT NULL,
	"reorder_point" integer NOT NULL,
	"replenish_quantity" integer NOT NULL,
	"lead_time_days" integer DEFAULT 1 NOT NULL,
	"safety_stock" integer DEFAULT 0 NOT NULL,
	"abc_classification" varchar(1),
	"velocity_category" varchar(20),
	"seasonal_factor" numeric(5, 4) DEFAULT '1.0000',
	"ml_model_id" varchar(100),
	"is_active" boolean DEFAULT true NOT NULL,
	"last_calculated" timestamp,
	"user_id" uuid,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "replenishment_tasks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"task_number" varchar(100) NOT NULL,
	"product_id" uuid NOT NULL,
	"warehouse_id" uuid NOT NULL,
	"from_location_id" uuid NOT NULL,
	"to_location_id" uuid NOT NULL,
	"rule_id" uuid NOT NULL,
	"trigger_reason" varchar(100) NOT NULL,
	"quantity_required" integer NOT NULL,
	"quantity_available" integer NOT NULL,
	"quantity_to_move" integer NOT NULL,
	"quantity_moved" integer DEFAULT 0 NOT NULL,
	"priority" varchar(20) DEFAULT 'medium' NOT NULL,
	"status" varchar(50) DEFAULT 'pending' NOT NULL,
	"assigned_to" uuid,
	"urgency_score" numeric(5, 2),
	"estimated_stockout" timestamp,
	"scheduled_for" timestamp,
	"started_at" timestamp,
	"completed_at" timestamp,
	"notes" text,
	"user_id" uuid,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "replenishment_tasks_task_number_unique" UNIQUE("task_number")
);
--> statement-breakpoint
CREATE TABLE "slotting_analytics" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" uuid NOT NULL,
	"warehouse_id" uuid NOT NULL,
	"current_location" varchar(100),
	"recommended_location" varchar(100),
	"rotation_frequency" numeric(10, 4),
	"picking_distance" numeric(10, 2),
	"affinity_score" numeric(5, 2),
	"seasonality_factor" numeric(5, 2),
	"last_optimization" timestamp,
	"improvement_potential" numeric(5, 2),
	"status" varchar(50) DEFAULT 'pending',
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "slotting_rules" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"warehouse_id" uuid NOT NULL,
	"rule_name" varchar(255) NOT NULL,
	"conditions" json NOT NULL,
	"actions" json NOT NULL,
	"priority" integer DEFAULT 1,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sscc_pallets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"sscc_code" varchar(18) NOT NULL,
	"pallet_type" varchar(50) NOT NULL,
	"status" varchar(50) DEFAULT 'building' NOT NULL,
	"warehouse_id" uuid NOT NULL,
	"location_id" uuid,
	"max_weight" numeric(10, 3) DEFAULT '1000.000' NOT NULL,
	"max_height" numeric(8, 2) DEFAULT '200.00' NOT NULL,
	"current_weight" numeric(10, 3) DEFAULT '0.000' NOT NULL,
	"current_height" numeric(8, 2) DEFAULT '0.00' NOT NULL,
	"item_count" integer DEFAULT 0 NOT NULL,
	"mixed_products" boolean DEFAULT false NOT NULL,
	"pallet_label" json,
	"shipment_id" uuid,
	"build_started_at" timestamp DEFAULT now(),
	"completed_at" timestamp,
	"user_id" uuid,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "sscc_pallets_sscc_code_unique" UNIQUE("sscc_code")
);
--> statement-breakpoint
CREATE TABLE "warehouse_layout" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"warehouse_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"version" varchar(50) DEFAULT '1.0' NOT NULL,
	"layout_data" json,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_by" uuid,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "warehouse_zones" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"warehouse_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"type" varchar(50) NOT NULL,
	"coordinates" json,
	"capacity" json,
	"current_utilization" json,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "worm_storage" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"audit_id" uuid NOT NULL,
	"data_hash" varchar(64) NOT NULL,
	"encrypted_data" text NOT NULL,
	"access_count" integer DEFAULT 0,
	"first_access" timestamp,
	"last_access" timestamp,
	"retention" timestamp NOT NULL,
	"immutable" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "asn" ADD CONSTRAINT "asn_supplier_id_suppliers_id_fk" FOREIGN KEY ("supplier_id") REFERENCES "public"."suppliers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "asn" ADD CONSTRAINT "asn_warehouse_id_warehouses_id_fk" FOREIGN KEY ("warehouse_id") REFERENCES "public"."warehouses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "asn" ADD CONSTRAINT "asn_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "asn_line_items" ADD CONSTRAINT "asn_line_items_asn_id_asn_id_fk" FOREIGN KEY ("asn_id") REFERENCES "public"."asn"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "asn_line_items" ADD CONSTRAINT "asn_line_items_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_trail" ADD CONSTRAINT "audit_trail_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cv_counting_results" ADD CONSTRAINT "cv_counting_results_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cv_counting_results" ADD CONSTRAINT "cv_counting_results_verified_by_users_id_fk" FOREIGN KEY ("verified_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "demand_forecasts" ADD CONSTRAINT "demand_forecasts_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "demand_forecasts" ADD CONSTRAINT "demand_forecasts_warehouse_id_warehouses_id_fk" FOREIGN KEY ("warehouse_id") REFERENCES "public"."warehouses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "digital_twin_simulations" ADD CONSTRAINT "digital_twin_simulations_warehouse_id_warehouses_id_fk" FOREIGN KEY ("warehouse_id") REFERENCES "public"."warehouses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "digital_twin_simulations" ADD CONSTRAINT "digital_twin_simulations_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fraud_detection" ADD CONSTRAINT "fraud_detection_investigated_by_users_id_fk" FOREIGN KEY ("investigated_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "optimization_jobs" ADD CONSTRAINT "optimization_jobs_warehouse_id_warehouses_id_fk" FOREIGN KEY ("warehouse_id") REFERENCES "public"."warehouses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "optimization_jobs" ADD CONSTRAINT "optimization_jobs_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pallet_items" ADD CONSTRAINT "pallet_items_pallet_id_sscc_pallets_id_fk" FOREIGN KEY ("pallet_id") REFERENCES "public"."sscc_pallets"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pallet_items" ADD CONSTRAINT "pallet_items_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pallet_items" ADD CONSTRAINT "pallet_items_added_by_users_id_fk" FOREIGN KEY ("added_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "picking_velocity" ADD CONSTRAINT "picking_velocity_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "picking_velocity" ADD CONSTRAINT "picking_velocity_warehouse_id_warehouses_id_fk" FOREIGN KEY ("warehouse_id") REFERENCES "public"."warehouses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "picking_velocity" ADD CONSTRAINT "picking_velocity_location_id_product_locations_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."product_locations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_affinity" ADD CONSTRAINT "product_affinity_product_a_products_id_fk" FOREIGN KEY ("product_a") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_affinity" ADD CONSTRAINT "product_affinity_product_b_products_id_fk" FOREIGN KEY ("product_b") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "putaway_rules" ADD CONSTRAINT "putaway_rules_warehouse_id_warehouses_id_fk" FOREIGN KEY ("warehouse_id") REFERENCES "public"."warehouses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "putaway_rules" ADD CONSTRAINT "putaway_rules_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "putaway_tasks" ADD CONSTRAINT "putaway_tasks_receipt_item_id_receiving_receipt_items_id_fk" FOREIGN KEY ("receipt_item_id") REFERENCES "public"."receiving_receipt_items"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "putaway_tasks" ADD CONSTRAINT "putaway_tasks_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "putaway_tasks" ADD CONSTRAINT "putaway_tasks_warehouse_id_warehouses_id_fk" FOREIGN KEY ("warehouse_id") REFERENCES "public"."warehouses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "putaway_tasks" ADD CONSTRAINT "putaway_tasks_suggested_location_id_product_locations_id_fk" FOREIGN KEY ("suggested_location_id") REFERENCES "public"."product_locations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "putaway_tasks" ADD CONSTRAINT "putaway_tasks_actual_location_id_product_locations_id_fk" FOREIGN KEY ("actual_location_id") REFERENCES "public"."product_locations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "putaway_tasks" ADD CONSTRAINT "putaway_tasks_rule_applied_putaway_rules_id_fk" FOREIGN KEY ("rule_applied") REFERENCES "public"."putaway_rules"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "putaway_tasks" ADD CONSTRAINT "putaway_tasks_assigned_to_users_id_fk" FOREIGN KEY ("assigned_to") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "putaway_tasks" ADD CONSTRAINT "putaway_tasks_cross_dock_order_orders_id_fk" FOREIGN KEY ("cross_dock_order") REFERENCES "public"."orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "putaway_tasks" ADD CONSTRAINT "putaway_tasks_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "real_time_visualization" ADD CONSTRAINT "real_time_visualization_warehouse_id_warehouses_id_fk" FOREIGN KEY ("warehouse_id") REFERENCES "public"."warehouses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "receiving_receipt_items" ADD CONSTRAINT "receiving_receipt_items_receipt_id_receiving_receipts_id_fk" FOREIGN KEY ("receipt_id") REFERENCES "public"."receiving_receipts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "receiving_receipt_items" ADD CONSTRAINT "receiving_receipt_items_asn_line_item_id_asn_line_items_id_fk" FOREIGN KEY ("asn_line_item_id") REFERENCES "public"."asn_line_items"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "receiving_receipt_items" ADD CONSTRAINT "receiving_receipt_items_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "receiving_receipt_items" ADD CONSTRAINT "receiving_receipt_items_location_id_product_locations_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."product_locations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "receiving_receipts" ADD CONSTRAINT "receiving_receipts_asn_id_asn_id_fk" FOREIGN KEY ("asn_id") REFERENCES "public"."asn"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "receiving_receipts" ADD CONSTRAINT "receiving_receipts_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "receiving_receipts" ADD CONSTRAINT "receiving_receipts_warehouse_id_warehouses_id_fk" FOREIGN KEY ("warehouse_id") REFERENCES "public"."warehouses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "receiving_receipts" ADD CONSTRAINT "receiving_receipts_received_by_users_id_fk" FOREIGN KEY ("received_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "receiving_receipts" ADD CONSTRAINT "receiving_receipts_supervisor_approval_users_id_fk" FOREIGN KEY ("supervisor_approval") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "replenishment_rules" ADD CONSTRAINT "replenishment_rules_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "replenishment_rules" ADD CONSTRAINT "replenishment_rules_warehouse_id_warehouses_id_fk" FOREIGN KEY ("warehouse_id") REFERENCES "public"."warehouses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "replenishment_rules" ADD CONSTRAINT "replenishment_rules_location_id_product_locations_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."product_locations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "replenishment_rules" ADD CONSTRAINT "replenishment_rules_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "replenishment_tasks" ADD CONSTRAINT "replenishment_tasks_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "replenishment_tasks" ADD CONSTRAINT "replenishment_tasks_warehouse_id_warehouses_id_fk" FOREIGN KEY ("warehouse_id") REFERENCES "public"."warehouses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "replenishment_tasks" ADD CONSTRAINT "replenishment_tasks_from_location_id_product_locations_id_fk" FOREIGN KEY ("from_location_id") REFERENCES "public"."product_locations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "replenishment_tasks" ADD CONSTRAINT "replenishment_tasks_to_location_id_product_locations_id_fk" FOREIGN KEY ("to_location_id") REFERENCES "public"."product_locations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "replenishment_tasks" ADD CONSTRAINT "replenishment_tasks_rule_id_replenishment_rules_id_fk" FOREIGN KEY ("rule_id") REFERENCES "public"."replenishment_rules"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "replenishment_tasks" ADD CONSTRAINT "replenishment_tasks_assigned_to_users_id_fk" FOREIGN KEY ("assigned_to") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "replenishment_tasks" ADD CONSTRAINT "replenishment_tasks_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "slotting_analytics" ADD CONSTRAINT "slotting_analytics_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "slotting_analytics" ADD CONSTRAINT "slotting_analytics_warehouse_id_warehouses_id_fk" FOREIGN KEY ("warehouse_id") REFERENCES "public"."warehouses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "slotting_rules" ADD CONSTRAINT "slotting_rules_warehouse_id_warehouses_id_fk" FOREIGN KEY ("warehouse_id") REFERENCES "public"."warehouses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sscc_pallets" ADD CONSTRAINT "sscc_pallets_warehouse_id_warehouses_id_fk" FOREIGN KEY ("warehouse_id") REFERENCES "public"."warehouses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sscc_pallets" ADD CONSTRAINT "sscc_pallets_location_id_product_locations_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."product_locations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sscc_pallets" ADD CONSTRAINT "sscc_pallets_shipment_id_shipments_id_fk" FOREIGN KEY ("shipment_id") REFERENCES "public"."shipments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sscc_pallets" ADD CONSTRAINT "sscc_pallets_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "warehouse_layout" ADD CONSTRAINT "warehouse_layout_warehouse_id_warehouses_id_fk" FOREIGN KEY ("warehouse_id") REFERENCES "public"."warehouses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "warehouse_layout" ADD CONSTRAINT "warehouse_layout_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "warehouse_zones" ADD CONSTRAINT "warehouse_zones_warehouse_id_warehouses_id_fk" FOREIGN KEY ("warehouse_id") REFERENCES "public"."warehouses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "worm_storage" ADD CONSTRAINT "worm_storage_audit_id_audit_trail_id_fk" FOREIGN KEY ("audit_id") REFERENCES "public"."audit_trail"("id") ON DELETE no action ON UPDATE no action;