/*
  # Fix test results cascade delete

  When a test is deleted, all associated test results should be deleted automatically.
  
  Changes:
  - Drop existing foreign key constraint on test_results.test_id
  - Add new foreign key constraint with ON DELETE CASCADE
*/

DO $$
BEGIN
  -- Drop existing foreign key constraint if it exists
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name = 'test_results' 
    AND constraint_type = 'FOREIGN KEY'
    AND constraint_name LIKE '%test_id%'
  ) THEN
    ALTER TABLE test_results
    DROP CONSTRAINT test_results_test_id_fkey;
  END IF;
END $$;

-- Add new foreign key with ON DELETE CASCADE
ALTER TABLE test_results
ADD CONSTRAINT test_results_test_id_fkey 
FOREIGN KEY (test_id) REFERENCES tests(id) ON DELETE CASCADE;
