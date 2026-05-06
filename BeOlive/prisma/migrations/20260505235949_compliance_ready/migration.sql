/*
  Warnings:

  - Added the required column `invoiceNumber` to the `Order` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "Setting" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "LegalPage" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "entity" TEXT NOT NULL,
    "entityId" INTEGER,
    "action" TEXT NOT NULL,
    "userId" INTEGER,
    "details" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Order" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "orderNumber" TEXT NOT NULL,
    "invoiceNumber" TEXT NOT NULL,
    "email" TEXT,
    "shippingAddress" TEXT,
    "billingAddress" TEXT,
    "paymentProvider" TEXT,
    "paymentProviderId" TEXT,
    "shippingTracking" TEXT,
    "adminNote" TEXT,
    "totalCents" INTEGER NOT NULL,
    "shippingCents" INTEGER NOT NULL,
    "taxCents" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'EUR',
    "status" TEXT NOT NULL DEFAULT 'pending',
    "paid" BOOLEAN NOT NULL DEFAULT false,
    "returned" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Order" ("createdAt", "currency", "email", "id", "orderNumber", "paid", "returned", "shippingAddress", "shippingCents", "status", "taxCents", "totalCents") SELECT "createdAt", "currency", "email", "id", "orderNumber", "paid", "returned", "shippingAddress", "shippingCents", "status", "taxCents", "totalCents" FROM "Order";
DROP TABLE "Order";
ALTER TABLE "new_Order" RENAME TO "Order";
CREATE UNIQUE INDEX "Order_orderNumber_key" ON "Order"("orderNumber");
CREATE UNIQUE INDEX "Order_invoiceNumber_key" ON "Order"("invoiceNumber");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;

-- CreateIndex
CREATE UNIQUE INDEX "Setting_key_key" ON "Setting"("key");

-- CreateIndex
CREATE UNIQUE INDEX "LegalPage_slug_key" ON "LegalPage"("slug");
