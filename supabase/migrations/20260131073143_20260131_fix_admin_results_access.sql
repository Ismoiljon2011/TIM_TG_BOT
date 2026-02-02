/*
  # Fix admin access to test results

  Admin users should be able to view all test results
  
  Changes:
  - Add policy for admins to view all test results
*/

DO $$
BEGIN
  -- Drop the old restrictive policy if it exists
  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'test_results' 
    AND policyname = 'Admins can view all results'
  ) THEN
    DROP POLICY "Admins can view all results" ON test_results;
  END IF;
END $$;

CREATE POLICY "Admins can view all results"
  ON test_results FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.is_admin = true
    )
  );
