CREATE TABLE "ProjectAsset" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ProjectAsset_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "ProjectAsset_projectId_createdAt_idx" ON "ProjectAsset"("projectId", "createdAt");
ALTER TABLE "ProjectAsset" ADD CONSTRAINT "ProjectAsset_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
