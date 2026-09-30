CREATE TABLE "demo_call_attempts" (
	"id" serial PRIMARY KEY,
	"ip_hash" text NOT NULL,
	"retell_call_id" text,
	"business_type" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "demo_call_attempts_ip_created_idx" ON "demo_call_attempts" ("ip_hash","created_at");