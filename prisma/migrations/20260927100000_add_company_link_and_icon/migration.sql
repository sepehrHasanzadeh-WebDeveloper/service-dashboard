-- Add optional company website and resolved favicon.
ALTER TABLE "Company" ADD COLUMN "link" TEXT;
ALTER TABLE "Company" ADD COLUMN "icon" TEXT;
