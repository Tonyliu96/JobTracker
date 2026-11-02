-- This migration changes the persisted names to match the Java and TypeScript API.
-- Rollback, only if V4+ has not depended on the new names:
-- ALTER TABLE applications RENAME COLUMN job_url TO joburl;
-- ALTER TABLE applications RENAME COLUMN reminded_at TO reminde_at;

ALTER TABLE applications RENAME COLUMN joburl TO job_url;
ALTER TABLE applications RENAME COLUMN reminde_at TO reminded_at;
