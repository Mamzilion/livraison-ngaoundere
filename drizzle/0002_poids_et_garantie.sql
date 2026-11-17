ALTER TABLE "deliveries" ADD COLUMN "weight_kg" double precision;--> statement-breakpoint
ALTER TABLE "deliveries" ADD COLUMN "declared_value" integer;--> statement-breakpoint
ALTER TABLE "deliveries" ADD COLUMN "insurance_fee" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "terms_accepted_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "terms_version" text;