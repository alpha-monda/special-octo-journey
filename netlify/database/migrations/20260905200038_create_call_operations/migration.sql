CREATE TABLE "assistants" (
	"id" serial PRIMARY KEY,
	"organization_id" integer NOT NULL,
	"retell_agent_id" text UNIQUE,
	"name" text NOT NULL,
	"phone_number" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "call_records" (
	"id" serial PRIMARY KEY,
	"organization_id" integer NOT NULL,
	"assistant_id" integer,
	"retell_call_id" text UNIQUE,
	"caller_number" text,
	"direction" text DEFAULT 'inbound' NOT NULL,
	"intent" text,
	"outcome" text,
	"duration_seconds" integer DEFAULT 0 NOT NULL,
	"transcript" text,
	"summary" text,
	"sentiment" text,
	"human_review_status" text DEFAULT 'not_required' NOT NULL,
	"metadata" jsonb DEFAULT '{}' NOT NULL,
	"started_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "integrations" (
	"id" serial PRIMARY KEY,
	"organization_id" integer NOT NULL,
	"provider" text NOT NULL,
	"status" text DEFAULT 'disconnected' NOT NULL,
	"external_account_id" text,
	"settings" jsonb DEFAULT '{}' NOT NULL,
	"last_synced_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "organizations" (
	"id" serial PRIMARY KEY,
	"name" text NOT NULL,
	"plan" text DEFAULT 'solo' NOT NULL,
	"timezone" text DEFAULT 'America/Chicago' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "assistants" ADD CONSTRAINT "assistants_organization_id_organizations_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id");--> statement-breakpoint
ALTER TABLE "call_records" ADD CONSTRAINT "call_records_organization_id_organizations_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id");--> statement-breakpoint
ALTER TABLE "call_records" ADD CONSTRAINT "call_records_assistant_id_assistants_id_fkey" FOREIGN KEY ("assistant_id") REFERENCES "assistants"("id");--> statement-breakpoint
ALTER TABLE "integrations" ADD CONSTRAINT "integrations_organization_id_organizations_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id");