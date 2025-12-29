-- Add orderNumber column to singers table
ALTER TABLE `singers` ADD COLUMN `orderNumber` INTEGER NOT NULL DEFAULT 0;

-- Create index for orderNumber for better performance
CREATE INDEX `singers_orderNumber_idx` ON `singers`(`orderNumber`);
