ALTER TABLE `conversations` ADD `shareToken` varchar(64);--> statement-breakpoint
ALTER TABLE `conversations` ADD `isPublic` enum('true','false') DEFAULT 'false';--> statement-breakpoint
ALTER TABLE `conversations` ADD CONSTRAINT `conversations_shareToken_unique` UNIQUE(`shareToken`);