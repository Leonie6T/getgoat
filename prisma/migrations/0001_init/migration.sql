-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "Sex" AS ENUM ('BUCK', 'DOE', 'WETHER');

-- CreateEnum
CREATE TYPE "IdMarkType" AS ENUM ('TATTOO', 'BRAND', 'EAR_TAG');

-- CreateEnum
CREATE TYPE "Pregnancy" AS ENUM ('YES', 'NO', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "GoatStatus" AS ENUM ('AVAILABLE', 'RESERVED', 'SOLD', 'COLLECTED', 'HIDDEN');

-- CreateEnum
CREATE TYPE "MediaKind" AS ENUM ('PHOTO', 'VIDEO');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'PAID', 'COLLECTED', 'CANCELLED', 'EXPIRED', 'REFUND_NEEDED', 'REFUNDED');

-- CreateTable
CREATE TABLE "Seller" (
    "id" TEXT NOT NULL,
    "businessName" TEXT NOT NULL,
    "companyRegNo" TEXT,
    "repName" TEXT,
    "repIdNumberEnc" TEXT,
    "farmName" TEXT,
    "farmAddress" TEXT,
    "cellphone" TEXT NOT NULL,
    "email" TEXT,
    "idMark" TEXT,
    "idMarkRegNo" TEXT,
    "signatureImageUrl" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Seller_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Goat" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "breed" TEXT NOT NULL,
    "sex" "Sex" NOT NULL,
    "ageMonths" INTEGER,
    "weightKg" DECIMAL(5,1),
    "colour" TEXT,
    "idMarkType" "IdMarkType" NOT NULL,
    "idMarkValue" TEXT NOT NULL,
    "priceCents" INTEGER NOT NULL,
    "notes" TEXT,
    "pregnant" "Pregnancy",
    "dueMonth" TEXT,
    "hasKidded" BOOLEAN,
    "kiddingCount" INTEGER,
    "status" "GoatStatus" NOT NULL DEFAULT 'AVAILABLE',
    "reservedUntil" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Goat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GoatMedia" (
    "id" TEXT NOT NULL,
    "goatId" TEXT NOT NULL,
    "kind" "MediaKind" NOT NULL,
    "cloudinaryId" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "GoatMedia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Buyer" (
    "id" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "idNumberEnc" TEXT NOT NULL,
    "cellphone" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "email" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Buyer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL,
    "number" SERIAL NOT NULL,
    "buyerId" TEXT NOT NULL,
    "totalCents" INTEGER NOT NULL,
    "status" "OrderStatus" NOT NULL DEFAULT 'PENDING',
    "driverName" TEXT,
    "driverIdNumberEnc" TEXT,
    "vehicleReg" TEXT,
    "consentAt" TIMESTAMP(3) NOT NULL,
    "payfastPaymentId" TEXT,
    "paidAt" TIMESTAMP(3),
    "collectedAt" TIMESTAMP(3),
    "documentUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderItem" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "goatId" TEXT NOT NULL,
    "priceCents" INTEGER NOT NULL,

    CONSTRAINT "OrderItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Goat_code_key" ON "Goat"("code");

-- CreateIndex
CREATE INDEX "Goat_status_idx" ON "Goat"("status");

-- CreateIndex
CREATE INDEX "GoatMedia_goatId_sortOrder_idx" ON "GoatMedia"("goatId", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "Order_number_key" ON "Order"("number");

-- CreateIndex
CREATE INDEX "Order_status_idx" ON "Order"("status");

-- CreateIndex
CREATE UNIQUE INDEX "OrderItem_orderId_goatId_key" ON "OrderItem"("orderId", "goatId");

-- AddForeignKey
ALTER TABLE "GoatMedia" ADD CONSTRAINT "GoatMedia_goatId_fkey" FOREIGN KEY ("goatId") REFERENCES "Goat"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "Buyer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_goatId_fkey" FOREIGN KEY ("goatId") REFERENCES "Goat"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

