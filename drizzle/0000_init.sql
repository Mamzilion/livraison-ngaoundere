CREATE TYPE "public"."delivery_status" AS ENUM('WAITING_LOCATION', 'READY', 'ASSIGNED', 'PICKED_UP', 'DELIVERED', 'FAILED', 'CANCELLED');--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('ADMIN', 'MERCHANT', 'DRIVER');--> statement-breakpoint
CREATE TABLE "deliveries" (
	"id" text PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"merchant_id" text NOT NULL,
	"driver_id" text,
	"customer_name" text NOT NULL,
	"customer_phone" text NOT NULL,
	"package_desc" text NOT NULL,
	"amount_to_collect" integer DEFAULT 0 NOT NULL,
	"heavy" boolean DEFAULT false NOT NULL,
	"night" boolean DEFAULT false NOT NULL,
	"location_token" text NOT NULL,
	"drop_lat" double precision,
	"drop_lng" double precision,
	"drop_accuracy" double precision,
	"drop_landmark" text,
	"distance_km" double precision,
	"price" integer,
	"status" "delivery_status" DEFAULT 'WAITING_LOCATION' NOT NULL,
	"fail_reason" text,
	"settled" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"located_at" timestamp with time zone,
	"assigned_at" timestamp with time zone,
	"picked_up_at" timestamp with time zone,
	"delivered_at" timestamp with time zone,
	"settled_at" timestamp with time zone,
	CONSTRAINT "deliveries_code_unique" UNIQUE("code"),
	CONSTRAINT "deliveries_location_token_unique" UNIQUE("location_token")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"phone" text NOT NULL,
	"password_hash" text NOT NULL,
	"role" "role" NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"shop_name" text,
	"pickup_landmark" text,
	"pickup_lat" double precision,
	"pickup_lng" double precision,
	CONSTRAINT "users_phone_unique" UNIQUE("phone")
);
--> statement-breakpoint
ALTER TABLE "deliveries" ADD CONSTRAINT "deliveries_merchant_id_users_id_fk" FOREIGN KEY ("merchant_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "deliveries" ADD CONSTRAINT "deliveries_driver_id_users_id_fk" FOREIGN KEY ("driver_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "deliveries_merchant_idx" ON "deliveries" USING btree ("merchant_id","created_at");--> statement-breakpoint
CREATE INDEX "deliveries_driver_idx" ON "deliveries" USING btree ("driver_id","status");--> statement-breakpoint
CREATE INDEX "deliveries_status_idx" ON "deliveries" USING btree ("status");