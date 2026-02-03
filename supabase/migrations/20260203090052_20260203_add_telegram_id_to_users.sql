/*
  # Add telegram_id to users table
  
  1. New Columns
    - `telegram_id` (bigint, unique) - Telegram user ID for linking accounts
  
  2. Changes
    - Added telegram_id column to users table
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'telegram_id'
  ) THEN
    ALTER TABLE users ADD COLUMN telegram_id bigint UNIQUE;
  END IF;
END $$;
