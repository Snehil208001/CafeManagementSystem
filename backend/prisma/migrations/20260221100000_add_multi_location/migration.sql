-- CreateTable
CREATE TABLE "Location" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Location_pkey" PRIMARY KEY ("id")
);

-- Insert default location
INSERT INTO "Location" ("id", "name", "address") VALUES ('loc_default', 'Main Branch', NULL);

-- Add locationId to CafeTable (nullable first)
ALTER TABLE "CafeTable" ADD COLUMN "locationId" TEXT;

-- Update existing rows
UPDATE "CafeTable" SET "locationId" = 'loc_default';

-- Make NOT NULL
ALTER TABLE "CafeTable" ALTER COLUMN "locationId" SET NOT NULL;

-- Drop old unique, add new
DROP INDEX IF EXISTS "CafeTable_tableNumber_key";
CREATE UNIQUE INDEX "CafeTable_locationId_tableNumber_key" ON "CafeTable"("locationId", "tableNumber");

-- Add FK
ALTER TABLE "CafeTable" ADD CONSTRAINT "CafeTable_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Add locationId to Dish
ALTER TABLE "Dish" ADD COLUMN "locationId" TEXT;
UPDATE "Dish" SET "locationId" = 'loc_default';
ALTER TABLE "Dish" ALTER COLUMN "locationId" SET NOT NULL;
ALTER TABLE "Dish" ADD CONSTRAINT "Dish_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Add locationId to Banner (nullable)
ALTER TABLE "Banner" ADD COLUMN "locationId" TEXT;
ALTER TABLE "Banner" ADD CONSTRAINT "Banner_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Add locationId to Offer (nullable)
ALTER TABLE "Offer" ADD COLUMN "locationId" TEXT;
ALTER TABLE "Offer" ADD CONSTRAINT "Offer_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE SET NULL ON UPDATE CASCADE;
