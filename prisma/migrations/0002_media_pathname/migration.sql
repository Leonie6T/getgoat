-- GoatMedia: store blob pathnames instead of Cloudinary ids
ALTER TABLE "GoatMedia" RENAME COLUMN "cloudinaryId" TO "pathname";
ALTER TABLE "GoatMedia" ADD COLUMN "thumbPathname" TEXT;
ALTER TABLE "GoatMedia" ADD COLUMN "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
