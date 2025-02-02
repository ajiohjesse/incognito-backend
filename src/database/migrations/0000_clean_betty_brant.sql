CREATE TABLE "conversations" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user1_id" text NOT NULL,
	"user2_id" text NOT NULL,
	"shared_key_encrypted_by_user1" text NOT NULL,
	"shared_key_encrypted_by_user2" text NOT NULL,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT "conversations_user1_id_user2_id_key" UNIQUE("user1_id","user2_id")
);
--> statement-breakpoint
CREATE TABLE "messages" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"conversation_id" text NOT NULL,
	"sender_id" text NOT NULL,
	"content_encrypted" text NOT NULL,
	"encryption_iv" text NOT NULL,
	"is_read" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	"device_fingerprint" text NOT NULL,
	"public_key" text NOT NULL,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT "users_device_fingerprint_unique" UNIQUE("device_fingerprint")
);
--> statement-breakpoint
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_user1_id_fkey" FOREIGN KEY ("user1_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_user2_id_fkey" FOREIGN KEY ("user2_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_conversations_user1" ON "conversations" USING btree ("user1_id" text_ops);--> statement-breakpoint
CREATE INDEX "idx_conversations_user2" ON "conversations" USING btree ("user2_id" text_ops);--> statement-breakpoint
CREATE INDEX "idx_messages_conversation" ON "messages" USING btree ("conversation_id" text_ops);--> statement-breakpoint
CREATE INDEX "idx_messages_sender" ON "messages" USING btree ("sender_id" text_ops);