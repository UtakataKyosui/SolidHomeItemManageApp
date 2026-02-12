CREATE TABLE `box_relations` (
	`id` integer PRIMARY KEY NOT NULL,
	`item_id` integer DEFAULT 0 NOT NULL,
	`box_id` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE `boxes` (
	`id` integer PRIMARY KEY NOT NULL,
	`name` text DEFAULT '' NOT NULL,
	`user_id` integer DEFAULT 0 NOT NULL,
	`storage_id` integer DEFAULT 0 NOT NULL,
	`is_default` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `box_relations_id_unique` ON `box_relations` (`id`);--> statement-breakpoint
CREATE UNIQUE INDEX `boxes_id_unique` ON `boxes` (`id`);