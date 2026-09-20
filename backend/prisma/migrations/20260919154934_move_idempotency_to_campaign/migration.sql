/*
  Warnings:

  - You are about to drop the column `idempotencyKey` on the `Email` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[idempotencyKey]` on the table `Campaign` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Email_idempotencyKey_key";

-- AlterTable
ALTER TABLE "Campaign" ADD COLUMN     "idempotencyKey" TEXT;

-- AlterTable
ALTER TABLE "Email" DROP COLUMN "idempotencyKey";

-- CreateIndex
CREATE UNIQUE INDEX "Campaign_idempotencyKey_key" ON "Campaign"("idempotencyKey");
