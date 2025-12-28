ALTER TABLE "scans" ADD COLUMN "progress" numeric(5, 2) DEFAULT '0';--> statement-breakpoint
ALTER TABLE "scans" ADD COLUMN "subdomains" jsonb;--> statement-breakpoint
ALTER TABLE "scans" ADD COLUMN "open_ports" jsonb;--> statement-breakpoint
ALTER TABLE "scans" ADD COLUMN "error" text;