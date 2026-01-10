ALTER TABLE "people" ADD COLUMN "contribution_type" text DEFAULT 'new';--> statement-breakpoint
ALTER TABLE "people" ADD COLUMN "original_id" text;--> statement-breakpoint
ALTER TABLE "resources" ADD COLUMN "contribution_type" text DEFAULT 'new';--> statement-breakpoint
ALTER TABLE "resources" ADD COLUMN "original_id" text;--> statement-breakpoint
ALTER TABLE "apps" ADD COLUMN "contribution_type" text DEFAULT 'new';--> statement-breakpoint
ALTER TABLE "apps" ADD COLUMN "original_id" text;