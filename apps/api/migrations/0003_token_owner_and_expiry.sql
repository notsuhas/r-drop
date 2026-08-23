ALTER TABLE `api_tokens` ADD `user_email` text;--> statement-breakpoint
ALTER TABLE `api_tokens` ADD `expires_at` integer;--> statement-breakpoint
ALTER TABLE `invites` ADD `workos_user_id` text;