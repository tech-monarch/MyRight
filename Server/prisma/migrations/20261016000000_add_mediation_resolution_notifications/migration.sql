-- Additive-only migration: creates the mediation, resolution and notification
-- objects that exist in schema.prisma but were never in a committed migration.
-- Only CREATE TYPE, CREATE TABLE, CREATE INDEX and ADD CONSTRAINT statements.

-- CreateEnum
CREATE TYPE "MediationSessionStatus" AS ENUM ('SCHEDULED', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ResolutionStatus" AS ENUM ('AWAITING_SIGNATURES', 'FULLY_SIGNED', 'VOID');

-- CreateEnum
CREATE TYPE "SigningParty" AS ENUM ('DISPUTANT', 'OTHER_PARTY');

-- CreateEnum
CREATE TYPE "NotificationChannel" AS ENUM ('WHATSAPP', 'EMAIL');

-- CreateEnum
CREATE TYPE "NotificationStatus" AS ENUM ('SENT', 'FAILED', 'SKIPPED');

-- CreateTable
CREATE TABLE "mediator_availability" (
    "id" TEXT NOT NULL,
    "lawyerId" TEXT NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,
    "startMinute" INTEGER NOT NULL,
    "endMinute" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mediator_availability_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mediation_sessions" (
    "id" TEXT NOT NULL,
    "disputeId" TEXT NOT NULL,
    "lawyerId" TEXT NOT NULL,
    "scheduledStart" TIMESTAMP(3) NOT NULL,
    "scheduledEnd" TIMESTAMP(3) NOT NULL,
    "meetingUrl" TEXT,
    "dailyRoomName" TEXT,
    "status" "MediationSessionStatus" NOT NULL DEFAULT 'SCHEDULED',
    "outcomeNotes" TEXT,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mediation_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mediation_attendance" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "participantName" TEXT NOT NULL,
    "joinedAt" TIMESTAMP(3),
    "leftAt" TIMESTAMP(3),
    "durationSec" INTEGER,
    "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mediation_attendance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "resolutions" (
    "id" TEXT NOT NULL,
    "disputeId" TEXT NOT NULL,
    "terms" TEXT NOT NULL,
    "status" "ResolutionStatus" NOT NULL DEFAULT 'AWAITING_SIGNATURES',
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "resolutions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "resolution_signatures" (
    "id" TEXT NOT NULL,
    "resolutionId" TEXT NOT NULL,
    "party" "SigningParty" NOT NULL,
    "signerName" TEXT NOT NULL,
    "userId" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "signedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "resolution_signatures_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "resolution_signing_tokens" (
    "id" TEXT NOT NULL,
    "resolutionId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "resolution_signing_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification_logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "channel" "NotificationChannel" NOT NULL,
    "recipient" TEXT NOT NULL,
    "template" TEXT NOT NULL,
    "status" "NotificationStatus" NOT NULL,
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notification_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "mediator_availability_lawyerId_idx" ON "mediator_availability"("lawyerId");

-- CreateIndex
CREATE INDEX "mediation_sessions_disputeId_idx" ON "mediation_sessions"("disputeId");

-- CreateIndex
CREATE INDEX "mediation_sessions_lawyerId_idx" ON "mediation_sessions"("lawyerId");

-- CreateIndex
CREATE INDEX "mediation_attendance_sessionId_idx" ON "mediation_attendance"("sessionId");

-- CreateIndex
CREATE INDEX "resolutions_disputeId_idx" ON "resolutions"("disputeId");

-- CreateIndex
CREATE UNIQUE INDEX "resolution_signatures_resolutionId_party_key" ON "resolution_signatures"("resolutionId", "party");

-- CreateIndex
CREATE UNIQUE INDEX "resolution_signing_tokens_tokenHash_key" ON "resolution_signing_tokens"("tokenHash");

-- CreateIndex
CREATE INDEX "resolution_signing_tokens_resolutionId_idx" ON "resolution_signing_tokens"("resolutionId");

-- CreateIndex
CREATE INDEX "notification_logs_userId_idx" ON "notification_logs"("userId");

-- AddForeignKey
ALTER TABLE "mediator_availability" ADD CONSTRAINT "mediator_availability_lawyerId_fkey" FOREIGN KEY ("lawyerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mediation_sessions" ADD CONSTRAINT "mediation_sessions_disputeId_fkey" FOREIGN KEY ("disputeId") REFERENCES "disputes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mediation_sessions" ADD CONSTRAINT "mediation_sessions_lawyerId_fkey" FOREIGN KEY ("lawyerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mediation_attendance" ADD CONSTRAINT "mediation_attendance_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "mediation_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resolutions" ADD CONSTRAINT "resolutions_disputeId_fkey" FOREIGN KEY ("disputeId") REFERENCES "disputes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resolutions" ADD CONSTRAINT "resolutions_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resolution_signatures" ADD CONSTRAINT "resolution_signatures_resolutionId_fkey" FOREIGN KEY ("resolutionId") REFERENCES "resolutions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resolution_signing_tokens" ADD CONSTRAINT "resolution_signing_tokens_resolutionId_fkey" FOREIGN KEY ("resolutionId") REFERENCES "resolutions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
