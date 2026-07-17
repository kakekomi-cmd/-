-- CreateTable
CREATE TABLE "Manuscript" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "jobType" TEXT NOT NULL,
    "conditions" TEXT NOT NULL,
    "requirements" TEXT NOT NULL,
    "appeal" TEXT NOT NULL,
    "content" TEXT NOT NULL DEFAULT '',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
