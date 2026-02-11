CREATE TABLE `item_categories` (
	`id` integer PRIMARY KEY NOT NULL,
	`name` text DEFAULT '' NOT NULL,
	`user_id` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE `item_category_relations` (
	`id` integer PRIMARY KEY NOT NULL,
	`item_id` integer DEFAULT 0 NOT NULL,
	`item_category_id` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE `items` (
	`id` integer PRIMARY KEY NOT NULL,
	`name` text DEFAULT '' NOT NULL,
	`description` text DEFAULT '' NOT NULL,
	`price` integer DEFAULT 0 NOT NULL,
	`quantity` integer DEFAULT 0 NOT NULL,
	`user_id` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE `storages` (
	`id` integer PRIMARY KEY NOT NULL,
	`name` text DEFAULT '' NOT NULL,
	`user_id` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE `storage_relations` (
	`id` integer PRIMARY KEY NOT NULL,
	`item_id` integer DEFAULT 0 NOT NULL,
	`storage_id` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` integer PRIMARY KEY NOT NULL,
	`username` text DEFAULT '' NOT NULL,
	`password` text DEFAULT '' NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `item_categories_id_unique` ON `item_categories` (`id`);--> statement-breakpoint
CREATE UNIQUE INDEX `item_category_relations_id_unique` ON `item_category_relations` (`id`);--> statement-breakpoint
CREATE UNIQUE INDEX `items_id_unique` ON `items` (`id`);--> statement-breakpoint
CREATE UNIQUE INDEX `storages_id_unique` ON `storages` (`id`);--> statement-breakpoint
CREATE UNIQUE INDEX `storage_relations_id_unique` ON `storage_relations` (`id`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_id_unique` ON `users` (`id`);