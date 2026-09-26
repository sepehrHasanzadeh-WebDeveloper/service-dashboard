-- DropIndex
DROP INDEX "Service_companyId_categoryId_idx";

-- CreateIndex
CREATE INDEX "Service_companyId_categoryId_order_idx" ON "Service"("companyId", "categoryId", "order");
