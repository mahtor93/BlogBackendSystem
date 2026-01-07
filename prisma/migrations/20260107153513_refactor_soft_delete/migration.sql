/*
  Warnings:

  - You are about to drop the column `deleteAt` on the `users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "TenantUser" ADD COLUMN     "deleteAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "users" DROP COLUMN "deleteAt";
