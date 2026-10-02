CREATE TABLE "audit_logs" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"tenant_id" varchar(64) NOT NULL,
	"action" varchar(64) NOT NULL,
	"category" varchar(64) NOT NULL,
	"description" text NOT NULL,
	"performed_by" varchar(255) NOT NULL,
	"user_role" varchar(32) NOT NULL,
	"hash" varchar(128) NOT NULL,
	"previous_hash" varchar(128) NOT NULL,
	"block_height" integer NOT NULL,
	"metadata" jsonb,
	"timestamp" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "certificates" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"tenant_id" varchar(64) NOT NULL,
	"supplier_id" varchar(64) NOT NULL,
	"standard" varchar(32) NOT NULL,
	"standard_label" varchar(128) NOT NULL,
	"certificate_number" varchar(128) NOT NULL,
	"license_number" varchar(128),
	"certification_body" varchar(255) NOT NULL,
	"issue_date" varchar(32) NOT NULL,
	"expiry_date" varchar(32) NOT NULL,
	"audit_date" varchar(32),
	"status" varchar(32) DEFAULT 'VALID' NOT NULL,
	"integrity_score" integer DEFAULT 95 NOT NULL,
	"scope_categories" jsonb DEFAULT '[]'::jsonb,
	"certified_sites" jsonb DEFAULT '[]'::jsonb,
	"pdf_storage_url" text,
	"ocr_extracted_data" jsonb,
	"last_verified_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "eudr_declarations" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"tenant_id" varchar(64) NOT NULL,
	"supplier_id" varchar(64) NOT NULL,
	"country_of_production" varchar(128) NOT NULL,
	"commodity" varchar(128) NOT NULL,
	"dds_reference" varchar(128) NOT NULL,
	"land_plots_count" integer DEFAULT 1 NOT NULL,
	"total_area_hectares" real NOT NULL,
	"traces_reference" varchar(128),
	"cutoff_date" varchar(32) NOT NULL,
	"polygon_coordinates_wgs84" jsonb NOT NULL,
	"status" varchar(32) DEFAULT 'VERIFIED_SAT' NOT NULL,
	"declared_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "field_audits" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"tenant_id" varchar(64) NOT NULL,
	"supplier_id" varchar(64) NOT NULL,
	"facility_name" varchar(255) NOT NULL,
	"auditor_name" varchar(255) NOT NULL,
	"audit_date" varchar(32) NOT NULL,
	"location_coordinates" jsonb,
	"overall_score" integer NOT NULL,
	"conclusion" varchar(32) NOT NULL,
	"capa_required" boolean DEFAULT false NOT NULL,
	"findings" jsonb,
	"status" varchar(32) DEFAULT 'SYNCED' NOT NULL,
	"synced_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "matrix_rules" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"tenant_id" varchar(64) NOT NULL,
	"product_category" varchar(255) NOT NULL,
	"target_country" varchar(16),
	"required_standards" jsonb NOT NULL,
	"min_integrity_score" integer DEFAULT 80 NOT NULL,
	"auto_block_on_expiration" boolean DEFAULT true NOT NULL,
	"max_derogation_days" integer DEFAULT 90 NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "suppliers" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"tenant_id" varchar(64) NOT NULL,
	"legal_name" varchar(255) NOT NULL,
	"trade_name" varchar(255),
	"siret" varchar(32),
	"vat_number" varchar(64),
	"country" varchar(128) NOT NULL,
	"country_code" varchar(8) NOT NULL,
	"address" text NOT NULL,
	"contact_name" varchar(255) NOT NULL,
	"contact_email" varchar(255) NOT NULL,
	"contact_phone" varchar(64),
	"tier" integer DEFAULT 1 NOT NULL,
	"spend_criticality" varchar(16) DEFAULT 'HIGH' NOT NULL,
	"product_categories" jsonb DEFAULT '[]'::jsonb,
	"erp_block_status" varchar(32) DEFAULT 'ALLOWED' NOT NULL,
	"erp_block_reason" text,
	"derogation_justification" text,
	"derogation_days" integer,
	"derogation_expires_at" timestamp with time zone,
	"multi_factor_risk" integer DEFAULT 20 NOT NULL,
	"risk_level" varchar(16) DEFAULT 'LOW' NOT NULL,
	"eudr_compliance_status" varchar(32) DEFAULT 'PENDING_GEO' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tenants" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"slug" varchar(64) NOT NULL,
	"plan" varchar(32) DEFAULT 'ENTERPRISE' NOT NULL,
	"max_suppliers" integer DEFAULT 500 NOT NULL,
	"max_certificates" integer DEFAULT 2000 NOT NULL,
	"features" jsonb DEFAULT '[]'::jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "tenants_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"clerk_id" varchar(128),
	"tenant_id" varchar(64) NOT NULL,
	"email" varchar(255) NOT NULL,
	"name" varchar(255) NOT NULL,
	"role" varchar(32) DEFAULT 'ADMIN' NOT NULL,
	"department" varchar(128),
	"avatar_url" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"last_login_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_clerk_id_unique" UNIQUE("clerk_id")
);
--> statement-breakpoint
CREATE TABLE "webhook_endpoints" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"tenant_id" varchar(64) NOT NULL,
	"name" varchar(255) NOT NULL,
	"target_url" text NOT NULL,
	"secret_key" varchar(128) NOT NULL,
	"events" jsonb NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"failure_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "certificates" ADD CONSTRAINT "certificates_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "certificates" ADD CONSTRAINT "certificates_supplier_id_suppliers_id_fk" FOREIGN KEY ("supplier_id") REFERENCES "public"."suppliers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "eudr_declarations" ADD CONSTRAINT "eudr_declarations_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "eudr_declarations" ADD CONSTRAINT "eudr_declarations_supplier_id_suppliers_id_fk" FOREIGN KEY ("supplier_id") REFERENCES "public"."suppliers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "field_audits" ADD CONSTRAINT "field_audits_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "field_audits" ADD CONSTRAINT "field_audits_supplier_id_suppliers_id_fk" FOREIGN KEY ("supplier_id") REFERENCES "public"."suppliers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "matrix_rules" ADD CONSTRAINT "matrix_rules_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "suppliers" ADD CONSTRAINT "suppliers_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "webhook_endpoints" ADD CONSTRAINT "webhook_endpoints_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;