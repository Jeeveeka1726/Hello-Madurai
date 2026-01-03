-- CreateTable
CREATE TABLE `magazine_pdfs` (
    `id` VARCHAR(191) NOT NULL,
    `filename` VARCHAR(191) NOT NULL,
    `url` VARCHAR(500) NULL,
    `publicId` VARCHAR(191) NULL,
    `mimeType` VARCHAR(191) NOT NULL,
    `size` INTEGER NOT NULL,
    `magazineId` VARCHAR(191) NULL,
    `collectionId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `magazine_pdfs` ADD CONSTRAINT `magazine_pdfs_magazineId_fkey` FOREIGN KEY (`magazineId`) REFERENCES `magazines`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `magazine_pdfs` ADD CONSTRAINT `magazine_pdfs_collectionId_fkey` FOREIGN KEY (`collectionId`) REFERENCES `magazine_collections`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
