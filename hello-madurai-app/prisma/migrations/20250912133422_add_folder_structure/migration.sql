/*
  Warnings:

  - You are about to drop the `podcasts` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `collectionId` to the `magazines` table without a default value. This is not possible if the table is not empty.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "podcasts";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "radio_folders" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "name_ta" TEXT,
    "description" TEXT,
    "description_ta" TEXT,
    "coverImage" TEXT,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "radio_shows" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "title_ta" TEXT,
    "description" TEXT NOT NULL,
    "description_ta" TEXT,
    "host" TEXT NOT NULL,
    "duration" TEXT NOT NULL,
    "audioUrl" TEXT NOT NULL,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "plays" INTEGER NOT NULL DEFAULT 0,
    "publishedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "folderId" TEXT NOT NULL,
    CONSTRAINT "radio_shows_folderId_fkey" FOREIGN KEY ("folderId") REFERENCES "radio_folders" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "magazine_collections" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "name_ta" TEXT,
    "description" TEXT,
    "description_ta" TEXT,
    "coverImage" TEXT,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- Insert default collection for existing magazines
INSERT INTO "magazine_collections" ("id", "name", "name_ta", "description", "description_ta", "featured", "createdAt", "updatedAt")
VALUES ('default-collection', 'General Issues', 'பொது இதழ்கள்', 'General magazine collection', 'பொது பத்திரிகை தொகுப்பு', false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Insert default radio folder
INSERT INTO "radio_folders" ("id", "name", "name_ta", "description", "description_ta", "featured", "createdAt", "updatedAt")
VALUES ('hello-madurai-folder', 'Hello Madurai', 'ஹலோ மதுரை', 'Main Hello Madurai radio shows', 'முக்கிய ஹலோ மதுரை வானொலி நிகழ்ச்சிகள்', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_magazines" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "title_ta" TEXT,
    "description" TEXT NOT NULL,
    "description_ta" TEXT,
    "pdfUrl" TEXT NOT NULL,
    "coverImage" TEXT,
    "featuredImage" TEXT,
    "issueNumber" TEXT NOT NULL,
    "publishedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "downloads" INTEGER NOT NULL DEFAULT 0,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "collectionId" TEXT NOT NULL,
    CONSTRAINT "magazines_collectionId_fkey" FOREIGN KEY ("collectionId") REFERENCES "magazine_collections" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_magazines" ("coverImage", "createdAt", "description", "description_ta", "downloads", "featured", "featuredImage", "id", "issueNumber", "pdfUrl", "publishedAt", "title", "title_ta", "updatedAt", "collectionId")
SELECT "coverImage", "createdAt", "description", "description_ta", "downloads", "featured", "featuredImage", "id", "issueNumber", "pdfUrl", "publishedAt", "title", "title_ta", "updatedAt", 'default-collection' FROM "magazines";
DROP TABLE "magazines";
ALTER TABLE "new_magazines" RENAME TO "magazines";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
