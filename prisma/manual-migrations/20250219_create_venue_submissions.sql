-- Ensure prostormat_venue_submissions exists for venue form submissions
CREATE TABLE IF NOT EXISTS "prostormat_venue_submissions" (
  "id" TEXT NOT NULL,
  "submissionType" TEXT NOT NULL DEFAULT 'new',
  "companyName" TEXT,
  "locationTitle" TEXT,
  "ico" TEXT,
  "contactName" TEXT,
  "contactEmail" TEXT,
  "contactPhone" TEXT,
  "additionalInfo" TEXT,
  "userId" TEXT,
  "userEmail" TEXT,
  "existingVenueId" TEXT,
  "status" TEXT NOT NULL DEFAULT 'new',
  "payload" JSONB,
  "createdAt" TIMESTAMP(3) WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) WITHOUT TIME ZONE NOT NULL,
  CONSTRAINT "prostormat_venue_submissions_pkey" PRIMARY KEY ("id")
);

-- Add foreign keys in an idempotent way
DO $$
BEGIN
  ALTER TABLE "prostormat_venue_submissions"
    ADD CONSTRAINT "prostormat_venue_submissions_existingVenueId_fkey"
    FOREIGN KEY ("existingVenueId") REFERENCES "prostormat_venues"("id")
    ON UPDATE CASCADE ON DELETE SET NULL;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER TABLE "prostormat_venue_submissions"
    ADD CONSTRAINT "prostormat_venue_submissions_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "prostormat_users"("id")
    ON UPDATE CASCADE ON DELETE SET NULL;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
