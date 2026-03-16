CREATE TYPE "public"."lead_status" AS ENUM('new', 'contacted', 'qualified', 'closed', 'lost');--> statement-breakpoint
CREATE TYPE "public"."lead_type" AS ENUM('buyer', 'seller', 'contact', 'tour');--> statement-breakpoint
CREATE TABLE "leads" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"type" "lead_type" NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text,
	"message" text,
	"property_id" text,
	"address" text,
	"preferred_contact" text,
	"source" text,
	"status" "lead_status" DEFAULT 'new' NOT NULL,
	"notes" text
);
