-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Service" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "name" TEXT,
    "description" TEXT NOT NULL DEFAULT '',
    "link" TEXT NOT NULL,
    "icon" TEXT,
    "logo" TEXT,
    "logoName" TEXT,
    "tone" TEXT NOT NULL DEFAULT 'violet',
    "isFavorite" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL DEFAULT 0,
    "companyId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Service_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Service_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Service" ("categoryId", "companyId", "createdAt", "description", "icon", "id", "link", "logo", "logoName", "name", "order", "title", "tone", "updatedAt") SELECT "categoryId", "companyId", "createdAt", "description", "icon", "id", "link", "logo", "logoName", "name", "order", "title", "tone", "updatedAt" FROM "Service";
DROP TABLE "Service";
ALTER TABLE "new_Service" RENAME TO "Service";
CREATE INDEX "Service_companyId_categoryId_order_idx" ON "Service"("companyId", "categoryId", "order");
CREATE INDEX "Service_title_idx" ON "Service"("title");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
