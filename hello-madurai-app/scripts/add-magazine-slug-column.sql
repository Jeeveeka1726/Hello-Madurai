-- Add slug column to magazines table
ALTER TABLE `magazines` 
ADD COLUMN `slug` VARCHAR(600) NULL UNIQUE AFTER `title_ta`,
ADD INDEX `magazines_slug_idx` (`slug`);
