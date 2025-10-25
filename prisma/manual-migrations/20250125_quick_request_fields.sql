-- Ensure the venue broadcast status enum exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type WHERE typname = 'VenueBroadcastStatus'
  ) THEN
    CREATE TYPE "VenueBroadcastStatus" AS ENUM ('pending', 'partial', 'completed');
  END IF;
END
$$;

-- Add status column with default if missing
ALTER TABLE "prostormat_venue_broadcasts"
  ADD COLUMN IF NOT EXISTS "status" "VenueBroadcastStatus" NOT NULL DEFAULT 'pending';

-- Add sentCount column with default if missing
ALTER TABLE "prostormat_venue_broadcasts"
  ADD COLUMN IF NOT EXISTS "sentCount" INTEGER NOT NULL DEFAULT 0;

-- Add lastSentAt column if missing
ALTER TABLE "prostormat_venue_broadcasts"
  ADD COLUMN IF NOT EXISTS "lastSentAt" TIMESTAMP(3);

-- Ensure the default for emailStatus on broadcast logs is pending
ALTER TABLE "prostormat_venue_broadcast_logs"
  ALTER COLUMN "emailStatus" SET DEFAULT 'pending';

-- Backfill any null status values to pending
UPDATE "prostormat_venue_broadcasts"
SET "status" = 'pending'
WHERE "status" IS NULL;
