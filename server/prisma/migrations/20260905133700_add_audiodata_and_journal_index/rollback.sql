-- SafeHaven Kenya: Rollback Migration (Down)
-- Migration: 20260905133700_add_audiodata_and_journal_index
-- Table: JournalEntry

SET lock_timeout = '3000ms';
SET statement_timeout = '10000ms';

-- Step 1: Drop composite index
DROP INDEX CONCURRENTLY IF EXISTS "JournalEntry_userId_date_idx";

-- Step 2: Drop column
ALTER TABLE "JournalEntry" 
DROP COLUMN IF EXISTS "audioData";
