-- CreateEnum
CREATE TYPE "RunStatus" AS ENUM ('RUNNING', 'COMPLETED', 'FAILED', 'SKIPPED');

-- CreateEnum
CREATE TYPE "Severity" AS ENUM ('SAFE', 'RISKY', 'BREAKING');

-- CreateEnum
CREATE TYPE "ChangeType" AS ENUM ('COLUMN_DROPPED', 'COLUMN_RENAMED', 'COLUMN_ADDED', 'TYPE_CHANGED', 'LOGIC_CHANGED', 'ENTITY_DROPPED');

-- CreateTable
CREATE TABLE "Repo" (
    "id" TEXT NOT NULL,
    "owner" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Repo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Run" (
    "id" TEXT NOT NULL,
    "repoId" TEXT NOT NULL,
    "prNumber" INTEGER NOT NULL,
    "prTitle" TEXT NOT NULL,
    "prUrl" TEXT NOT NULL,
    "headSha" TEXT NOT NULL,
    "status" "RunStatus" NOT NULL DEFAULT 'RUNNING',
    "severity" "Severity",
    "summary" TEXT,
    "suggestedFix" TEXT,
    "commentUrl" TEXT,
    "error" TEXT,
    "wroteBack" BOOLEAN NOT NULL DEFAULT false,
    "incidentUrns" TEXT[],
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" TIMESTAMP(3),

    CONSTRAINT "Run_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChangeIntent" (
    "id" TEXT NOT NULL,
    "runId" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entityUrn" TEXT,
    "column" TEXT,
    "changeType" "ChangeType" NOT NULL,
    "detail" TEXT NOT NULL,
    "renamedTo" TEXT,

    CONSTRAINT "ChangeIntent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ImpactedAsset" (
    "id" TEXT NOT NULL,
    "runId" TEXT NOT NULL,
    "urn" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "owner" TEXT,
    "hop" INTEGER NOT NULL,
    "viaColumn" TEXT,
    "severity" "Severity" NOT NULL,

    CONSTRAINT "ImpactedAsset_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Repo_owner_name_key" ON "Repo"("owner", "name");

-- CreateIndex
CREATE INDEX "Run_repoId_prNumber_idx" ON "Run"("repoId", "prNumber");

-- AddForeignKey
ALTER TABLE "Run" ADD CONSTRAINT "Run_repoId_fkey" FOREIGN KEY ("repoId") REFERENCES "Repo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChangeIntent" ADD CONSTRAINT "ChangeIntent_runId_fkey" FOREIGN KEY ("runId") REFERENCES "Run"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ImpactedAsset" ADD CONSTRAINT "ImpactedAsset_runId_fkey" FOREIGN KEY ("runId") REFERENCES "Run"("id") ON DELETE CASCADE ON UPDATE CASCADE;
