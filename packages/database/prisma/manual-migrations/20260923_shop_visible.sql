-- Safe additive SQLite migration. Existing catalogue items remain unpublished.
ALTER TABLE "CatalogueItem" ADD COLUMN "shopVisible" BOOLEAN NOT NULL DEFAULT false;
