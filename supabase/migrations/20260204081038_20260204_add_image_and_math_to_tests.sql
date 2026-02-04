/*
  # Add image URL and math symbols support to tests and questions
  
  1. New Columns
    - `tests.image_url` (text) - URL for test cover image
    - `questions.has_math_symbols` (boolean) - Flag for math content
  
  2. Changes
    - Added optional image_url to tests table
    - Added optional has_math_symbols flag to questions
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tests' AND column_name = 'image_url'
  ) THEN
    ALTER TABLE tests ADD COLUMN image_url text;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'questions' AND column_name = 'has_math_symbols'
  ) THEN
    ALTER TABLE questions ADD COLUMN has_math_symbols boolean DEFAULT false;
  END IF;
END $$;
