CREATE TABLE "geofence_alerts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"vehicle_id" uuid NOT NULL,
	"geofence_id" uuid NOT NULL,
	"alert_type" varchar(20) NOT NULL,
	"trigger_location" json NOT NULL,
	"driver_id" uuid,
	"assignment_id" uuid,
	"status" varchar(20) DEFAULT 'ativo' NOT NULL,
	"acknowledged_by" uuid,
	"acknowledged_at" timestamp,
	"metadata" json,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "geofences" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"type" varchar(50) NOT NULL,
	"warehouse_id" uuid,
	"polygon_coordinates" json NOT NULL,
	"radius" numeric(10, 2),
	"alert_on_enter" boolean DEFAULT false NOT NULL,
	"alert_on_exit" boolean DEFAULT false NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_by" uuid,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "gps_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"vehicle_id" uuid,
	"session_type" varchar(20) NOT NULL,
	"status" varchar(20) NOT NULL,
	"device_info" json,
	"gps_permission" boolean NOT NULL,
	"gps_accuracy" numeric(5, 2),
	"start_location" json,
	"end_location" json,
	"total_distance" numeric(10, 2),
	"total_duration" integer,
	"tracking_points" integer DEFAULT 0,
	"violations" json,
	"started_at" timestamp DEFAULT now(),
	"ended_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "gps_tracking" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"vehicle_id" uuid NOT NULL,
	"latitude" numeric(10, 8) NOT NULL,
	"longitude" numeric(11, 8) NOT NULL,
	"speed" numeric(5, 2),
	"heading" numeric(5, 2),
	"altitude" numeric(7, 2),
	"accuracy" numeric(5, 2),
	"battery_level" integer,
	"signal_strength" integer,
	"is_engine_on" boolean,
	"user_id" uuid,
	"device_type" varchar(50) DEFAULT 'mobile',
	"metadata" json,
	"timestamp" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "vehicle_assignments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"vehicle_id" uuid NOT NULL,
	"order_id" uuid,
	"shipment_id" uuid,
	"driver_id" uuid NOT NULL,
	"status" varchar(20) DEFAULT 'atribuido' NOT NULL,
	"priority" varchar(20) DEFAULT 'normal' NOT NULL,
	"estimated_departure" timestamp,
	"actual_departure" timestamp,
	"estimated_arrival" timestamp,
	"actual_arrival" timestamp,
	"estimated_distance" numeric(10, 2),
	"actual_distance" numeric(10, 2),
	"load_capacity_used" numeric(5, 2),
	"delivery_instructions" text,
	"current_location" json,
	"route_data" json,
	"delivery_proof" json,
	"notes" text,
	"assigned_by" uuid,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "vehicle_maintenance" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"vehicle_id" uuid NOT NULL,
	"type" varchar(50) NOT NULL,
	"description" text NOT NULL,
	"cost" numeric(10, 2),
	"service_provider" varchar(255),
	"maintenance_date" timestamp NOT NULL,
	"next_maintenance_date" timestamp,
	"mileage" integer,
	"status" varchar(20) DEFAULT 'concluida' NOT NULL,
	"performed_by" uuid,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "vehicles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"license_plate" varchar(20) NOT NULL,
	"brand" varchar(100) NOT NULL,
	"model" varchar(100) NOT NULL,
	"year" integer NOT NULL,
	"capacity_kg" numeric(10, 2),
	"capacity_m3" numeric(10, 3),
	"fuel_type" varchar(20) NOT NULL,
	"status" varchar(20) DEFAULT 'ativo' NOT NULL,
	"insurance_expiry" timestamp,
	"inspection_expiry" timestamp,
	"driver_id" uuid,
	"gps_device_id" varchar(100),
	"is_gps_active" boolean DEFAULT false NOT NULL,
	"last_gps_update" timestamp,
	"notes" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "vehicles_license_plate_unique" UNIQUE("license_plate")
);
--> statement-breakpoint
ALTER TABLE "geofence_alerts" ADD CONSTRAINT "geofence_alerts_vehicle_id_vehicles_id_fk" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "geofence_alerts" ADD CONSTRAINT "geofence_alerts_geofence_id_geofences_id_fk" FOREIGN KEY ("geofence_id") REFERENCES "public"."geofences"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "geofence_alerts" ADD CONSTRAINT "geofence_alerts_driver_id_users_id_fk" FOREIGN KEY ("driver_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "geofence_alerts" ADD CONSTRAINT "geofence_alerts_assignment_id_vehicle_assignments_id_fk" FOREIGN KEY ("assignment_id") REFERENCES "public"."vehicle_assignments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "geofence_alerts" ADD CONSTRAINT "geofence_alerts_acknowledged_by_users_id_fk" FOREIGN KEY ("acknowledged_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "geofences" ADD CONSTRAINT "geofences_warehouse_id_warehouses_id_fk" FOREIGN KEY ("warehouse_id") REFERENCES "public"."warehouses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "geofences" ADD CONSTRAINT "geofences_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gps_sessions" ADD CONSTRAINT "gps_sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gps_sessions" ADD CONSTRAINT "gps_sessions_vehicle_id_vehicles_id_fk" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gps_tracking" ADD CONSTRAINT "gps_tracking_vehicle_id_vehicles_id_fk" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gps_tracking" ADD CONSTRAINT "gps_tracking_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vehicle_assignments" ADD CONSTRAINT "vehicle_assignments_vehicle_id_vehicles_id_fk" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vehicle_assignments" ADD CONSTRAINT "vehicle_assignments_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vehicle_assignments" ADD CONSTRAINT "vehicle_assignments_shipment_id_shipments_id_fk" FOREIGN KEY ("shipment_id") REFERENCES "public"."shipments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vehicle_assignments" ADD CONSTRAINT "vehicle_assignments_driver_id_users_id_fk" FOREIGN KEY ("driver_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vehicle_assignments" ADD CONSTRAINT "vehicle_assignments_assigned_by_users_id_fk" FOREIGN KEY ("assigned_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vehicle_maintenance" ADD CONSTRAINT "vehicle_maintenance_vehicle_id_vehicles_id_fk" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vehicle_maintenance" ADD CONSTRAINT "vehicle_maintenance_performed_by_users_id_fk" FOREIGN KEY ("performed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vehicles" ADD CONSTRAINT "vehicles_driver_id_users_id_fk" FOREIGN KEY ("driver_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;