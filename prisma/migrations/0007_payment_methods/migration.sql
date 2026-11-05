-- EFT and cash-at-collection orders, confirmed by the seller
CREATE TYPE "PaymentMethod" AS ENUM ('CARD', 'EFT', 'CASH');
ALTER TYPE "OrderStatus" ADD VALUE 'AWAITING_PAYMENT';
ALTER TYPE "NotificationKind" ADD VALUE 'AWAITING_PAYMENT';
ALTER TABLE "Order" ADD COLUMN "paymentMethod" "PaymentMethod" NOT NULL DEFAULT 'CARD';
