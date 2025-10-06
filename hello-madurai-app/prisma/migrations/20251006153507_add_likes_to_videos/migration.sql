-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_videos" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "title_ta" TEXT,
    "description" TEXT NOT NULL,
    "description_ta" TEXT,
    "videoUrl" TEXT NOT NULL,
    "youtubeId" TEXT,
    "thumbnail" TEXT,
    "category" TEXT NOT NULL,
    "duration" TEXT,
    "views" INTEGER NOT NULL DEFAULT 0,
    "likes" INTEGER NOT NULL DEFAULT 0,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "publishedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_videos" ("category", "createdAt", "description", "description_ta", "duration", "featured", "id", "publishedAt", "thumbnail", "title", "title_ta", "updatedAt", "videoUrl", "views", "youtubeId") SELECT "category", "createdAt", "description", "description_ta", "duration", "featured", "id", "publishedAt", "thumbnail", "title", "title_ta", "updatedAt", "videoUrl", "views", "youtubeId" FROM "videos";
DROP TABLE "videos";
ALTER TABLE "new_videos" RENAME TO "videos";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
