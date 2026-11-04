-- Checkout: reservation owner, buyer ID type, order expiry
CREATE TYPE "IdType" AS ENUM ('SA_ID', 'PASSPORT');
ALTER TABLE "Goat" ADD COLUMN "reservedOrderId" TEXT;
ALTER TABLE "Buyer" ADD COLUMN "idType" "IdType" NOT NULL DEFAULT 'SA_ID';
ALTER TABLE "Order" ADD COLUMN "expiresAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "Order" ALTER COLUMN "expiresAt" DROP DEFAULT;
