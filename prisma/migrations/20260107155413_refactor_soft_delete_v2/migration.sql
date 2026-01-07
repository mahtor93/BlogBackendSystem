/*
  Warnings:

  - You are about to drop the column `deleteAt` on the `TenantUser` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "TenantUser" DROP COLUMN "deleteAt";

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "deleteAt" TIMESTAMP(3);
