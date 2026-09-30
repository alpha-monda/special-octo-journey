ALTER TABLE "demo_call_attempts" ADD COLUMN "duration_sec" integer;--> statement-breakpoint
ALTER TABLE "demo_call_attempts" ADD COLUMN "summary" text;--> statement-breakpoint
ALTER TABLE "demo_call_attempts" ADD COLUMN "transcript" text;--> statement-breakpoint
ALTER TABLE "demo_call_attempts" ADD COLUMN "emailed_at" timestamp;