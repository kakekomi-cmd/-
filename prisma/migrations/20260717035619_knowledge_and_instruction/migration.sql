/*
  Warnings:

  - You are about to drop the column `appeal` on the `Manuscript` table. All the data in the column will be lost.
  - You are about to drop the column `conditions` on the `Manuscript` table. All the data in the column will be lost.
  - You are about to drop the column `jobType` on the `Manuscript` table. All the data in the column will be lost.
  - You are about to drop the column `requirements` on the `Manuscript` table. All the data in the column will be lost.

*/
-- CreateTable
CREATE TABLE "KnowledgeManuscript" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Manuscript" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "instruction" TEXT NOT NULL DEFAULT '',
    "content" TEXT NOT NULL DEFAULT '',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Manuscript" ("content", "createdAt", "id", "status", "title", "updatedAt") SELECT "content", "createdAt", "id", "status", "title", "updatedAt" FROM "Manuscript";
DROP TABLE "Manuscript";
ALTER TABLE "new_Manuscript" RENAME TO "Manuscript";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
