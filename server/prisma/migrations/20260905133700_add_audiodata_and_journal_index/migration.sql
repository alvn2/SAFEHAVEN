-- SafeHaven Kenya: Forward Migration (Up)
-- Migration: 20260905133700_add_audiodata_and_journal_index
-- Table: JournalEntry

-- Set lock timeout to avoid queueing locks in production
SET lock_timeout = '3000ms';
SET statement_timeout = '10000ms';

-- Step 1: Add audioData column if not exists
ALTER TABLE "JournalEntry" 
ADD COLUMN IF NOT EXISTS "audioData" TEXT;

-- Step 2: Create composite query index
CREATE INDEX CONCURRENTLY IF NOT EXISTS "JournalEntry_userId_date_idx" 
ON "JournalEntry"("userId", "date");
