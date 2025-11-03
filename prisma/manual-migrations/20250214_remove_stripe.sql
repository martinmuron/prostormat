-- AlterTable
ALTER TABLE "prostormat_venues" DROP COLUMN IF EXISTS "subscriptionId";
ALTER TABLE "prostormat_venues" DROP COLUMN IF EXISTS "subscriptionStatus";

-- DropTable
DROP TABLE IF EXISTS "Subscription" CASCADE;
DROP TABLE IF EXISTS "prostormat_subscriptions" CASCADE;
DROP TABLE IF EXISTS "prostormat_payment_intents" CASCADE;
