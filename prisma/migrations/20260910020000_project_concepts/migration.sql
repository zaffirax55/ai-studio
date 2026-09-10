CREATE TABLE "ProjectConcept" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ProjectConcept_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "ProjectConcept_projectId_createdAt_idx" ON "ProjectConcept"("projectId", "createdAt");
ALTER TABLE "ProjectConcept" ADD CONSTRAINT "ProjectConcept_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
