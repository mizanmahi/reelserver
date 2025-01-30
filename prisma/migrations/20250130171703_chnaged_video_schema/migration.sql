/*
  Warnings:

  - You are about to drop the column `likeCount` on the `Video` table. All the data in the column will be lost.
  - You are about to drop the column `thumbnailUrl` on the `Video` table. All the data in the column will be lost.
  - You are about to drop the column `uploadedBy` on the `Video` table. All the data in the column will be lost.
  - You are about to drop the column `url` on the `Video` table. All the data in the column will be lost.
  - You are about to drop the column `viewCount` on the `Video` table. All the data in the column will be lost.
  - Added the required column `thumbnail` to the `Video` table without a default value. This is not possible if the table is not empty.
  - Added the required column `uploaderId` to the `Video` table without a default value. This is not possible if the table is not empty.
  - Added the required column `videoUrl` to the `Video` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Video" DROP CONSTRAINT "Video_uploadedBy_fkey";

-- AlterTable
ALTER TABLE "Video" DROP COLUMN "likeCount",
DROP COLUMN "thumbnailUrl",
DROP COLUMN "uploadedBy",
DROP COLUMN "url",
DROP COLUMN "viewCount",
ADD COLUMN     "metadata" JSONB,
ADD COLUMN     "thumbnail" TEXT NOT NULL,
ADD COLUMN     "uploaderId" TEXT NOT NULL,
ADD COLUMN     "videoUrl" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Video" ADD CONSTRAINT "Video_uploaderId_fkey" FOREIGN KEY ("uploaderId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
