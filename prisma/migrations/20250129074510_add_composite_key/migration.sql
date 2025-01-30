/*
  Warnings:

  - The primary key for the `Engagement` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `Engagement` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Engagement" DROP CONSTRAINT "Engagement_pkey",
DROP COLUMN "id",
ADD CONSTRAINT "Engagement_pkey" PRIMARY KEY ("videoId", "userId");
