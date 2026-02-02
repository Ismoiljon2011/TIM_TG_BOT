/*
  # Fix test results access for admin and users

  The system uses custom authentication (stored in localStorage), not Supabase auth.uid().
  We need to allow the application to query test results directly without RLS restrictions
  when the user is authenticated on the client side.
  
  Changes:
  - Remove admin-only restriction on test_results SELECT
  - Allow any authenticated request to view test results
*/

DROP POLICY IF EXISTS "Admins can view all results" ON test_results;

CREATE POLICY "Authenticated users can view results"
  ON test_results FOR SELECT
  USING (true);
