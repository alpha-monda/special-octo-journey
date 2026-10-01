CREATE TABLE "agent_settings_versions" (
	"id" serial PRIMARY KEY,
	"organization_id" integer NOT NULL,
	"version" integer NOT NULL,
	"settings" jsonb NOT NULL,
	"note" text,
	"created_by" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "assistants" ADD COLUMN "retell_llm_id" text;--> statement-breakpoint
ALTER TABLE "assistants" ADD COLUMN "area_code" integer;--> statement-breakpoint
ALTER TABLE "call_records" ADD COLUMN "delivery_status" jsonb DEFAULT '{}' NOT NULL;--> statement-breakpoint
ALTER TABLE "organizations" ADD COLUMN "status" text DEFAULT 'pending_setup' NOT NULL;--> statement-breakpoint
ALTER TABLE "organizations" ADD COLUMN "contact_name" text;--> statement-breakpoint
ALTER TABLE "organizations" ADD COLUMN "contact_email" text;--> statement-breakpoint
ALTER TABLE "organizations" ADD COLUMN "notify_emails" jsonb DEFAULT '[]' NOT NULL;--> statement-breakpoint
ALTER TABLE "organizations" ADD COLUMN "stripe_customer_id" text;--> statement-breakpoint
ALTER TABLE "organizations" ADD COLUMN "stripe_subscription_id" text;--> statement-breakpoint
ALTER TABLE "organizations" ADD COLUMN "updated_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "agent_settings_versions_org_version_idx" ON "agent_settings_versions" ("organization_id","version");--> statement-breakpoint
ALTER TABLE "agent_settings_versions" ADD CONSTRAINT "agent_settings_versions_organization_id_organizations_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id");