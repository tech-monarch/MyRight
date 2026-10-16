-- Additive-only migration: new roles, other-party acceptance, in-app
-- notifications, platform settings and database-backed WhatsApp sessions.
-- Adds enum values, columns, tables, indexes and foreign keys. Removes nothing.

-- AlterEnum
ALTER TYPE "UserRole" ADD VALUE 'PLATFORM_ADMIN';
ALTER TYPE "UserRole" ADD VALUE 'COURTHOUSE_STAFF';

-- CreateEnum
CREATE TYPE "PartyResponse" AS ENUM ('PENDING', 'ACCEPTED', 'DECLINED');

-- AlterTable
ALTER TABLE "users" ADD COLUMN "permissions" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- AlterTable
ALTER TABLE "disputes" ADD COLUMN "otherPartyResponse" "PartyResponse",
ADD COLUMN "otherPartyRespondedAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "mediation_invitations" (
    "id" TEXT NOT NULL,
    "disputeId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mediation_invitations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "link" TEXT,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "platform_settings" (
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "platform_settings_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE "whatsapp_sessions" (
    "scopeKey" TEXT NOT NULL,
    "phoneNumber" TEXT,
    "creds" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "whatsapp_sessions_pkey" PRIMARY KEY ("scopeKey")
);

-- CreateTable
CREATE TABLE "whatsapp_auth_keys" (
    "scopeKey" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "keyId" TEXT NOT NULL,
    "value" TEXT NOT NULL,

    CONSTRAINT "whatsapp_auth_keys_pkey" PRIMARY KEY ("scopeKey","type","keyId")
);

-- CreateIndex
CREATE UNIQUE INDEX "mediation_invitations_tokenHash_key" ON "mediation_invitations"("tokenHash");

-- CreateIndex
CREATE INDEX "mediation_invitations_disputeId_idx" ON "mediation_invitations"("disputeId");

-- CreateIndex
CREATE INDEX "notifications_userId_createdAt_idx" ON "notifications"("userId", "createdAt");

-- AddForeignKey
ALTER TABLE "mediation_invitations" ADD CONSTRAINT "mediation_invitations_disputeId_fkey" FOREIGN KEY ("disputeId") REFERENCES "disputes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "whatsapp_auth_keys" ADD CONSTRAINT "whatsapp_auth_keys_scopeKey_fkey" FOREIGN KEY ("scopeKey") REFERENCES "whatsapp_sessions"("scopeKey") ON DELETE CASCADE ON UPDATE CASCADE;
