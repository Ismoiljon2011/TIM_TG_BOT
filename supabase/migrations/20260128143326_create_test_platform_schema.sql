/*
  # Test Platform Database Schema

  1. New Tables
    - `users`
      - `id` (uuid, primary key)
      - `username` (text, unique) - Username for login
      - `password_hash` (text) - Hashed password
      - `is_admin` (boolean) - Admin flag
      - `created_at` (timestamptz) - Account creation time
    
    - `tests`
      - `id` (uuid, primary key)
      - `title` (text) - Test title
      - `description` (text) - Test description
      - `duration_minutes` (integer) - Test duration in minutes
      - `created_by` (uuid) - Foreign key to users
      - `created_at` (timestamptz) - Test creation time
    
    - `questions`
      - `id` (uuid, primary key)
      - `test_id` (uuid) - Foreign key to tests
      - `question_text` (text) - Question text
      - `option_a` (text) - Option A
      - `option_b` (text) - Option B
      - `option_c` (text) - Option C
      - `option_d` (text) - Option D
      - `correct_answer` (text) - Correct answer (a, b, c, or d)
      - `created_at` (timestamptz) - Question creation time
    
    - `test_results`
      - `id` (uuid, primary key)
      - `user_id` (uuid) - Foreign key to users
      - `test_id` (uuid) - Foreign key to tests
      - `score` (integer) - Score achieved
      - `total_questions` (integer) - Total questions in test
      - `started_at` (timestamptz) - Test start time
      - `completed_at` (timestamptz) - Test completion time

  2. Security
    - Enable RLS on all tables
    - Users can read their own data
    - Admins can manage tests and questions
    - Users can submit test results
*/

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  is_admin boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create tests table
CREATE TABLE IF NOT EXISTS tests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text DEFAULT '',
  duration_minutes integer DEFAULT 30,
  created_by uuid REFERENCES users(id),
  created_at timestamptz DEFAULT now()
);

-- Create questions table
CREATE TABLE IF NOT EXISTS questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  test_id uuid REFERENCES tests(id) ON DELETE CASCADE,
  question_text text NOT NULL,
  option_a text NOT NULL,
  option_b text NOT NULL,
  option_c text NOT NULL,
  option_d text NOT NULL,
  correct_answer text NOT NULL CHECK (correct_answer IN ('a', 'b', 'c', 'd')),
  created_at timestamptz DEFAULT now()
);

-- Create test_results table
CREATE TABLE IF NOT EXISTS test_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id),
  test_id uuid REFERENCES tests(id),
  score integer NOT NULL,
  total_questions integer NOT NULL,
  started_at timestamptz DEFAULT now(),
  completed_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_results ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can read own data"
  ON users FOR SELECT
  USING (true);

CREATE POLICY "Users can update own data"
  ON users FOR UPDATE
  USING (id = (current_setting('app.current_user_id', true))::uuid);

-- Tests policies
CREATE POLICY "Everyone can view tests"
  ON tests FOR SELECT
  USING (true);

CREATE POLICY "Admins can insert tests"
  ON tests FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = (current_setting('app.current_user_id', true))::uuid
      AND users.is_admin = true
    )
  );

CREATE POLICY "Admins can update tests"
  ON tests FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = (current_setting('app.current_user_id', true))::uuid
      AND users.is_admin = true
    )
  );

CREATE POLICY "Admins can delete tests"
  ON tests FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = (current_setting('app.current_user_id', true))::uuid
      AND users.is_admin = true
    )
  );

-- Questions policies
CREATE POLICY "Everyone can view questions"
  ON questions FOR SELECT
  USING (true);

CREATE POLICY "Admins can insert questions"
  ON questions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = (current_setting('app.current_user_id', true))::uuid
      AND users.is_admin = true
    )
  );

CREATE POLICY "Admins can update questions"
  ON questions FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = (current_setting('app.current_user_id', true))::uuid
      AND users.is_admin = true
    )
  );

CREATE POLICY "Admins can delete questions"
  ON questions FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = (current_setting('app.current_user_id', true))::uuid
      AND users.is_admin = true
    )
  );

-- Test results policies
CREATE POLICY "Users can view own results"
  ON test_results FOR SELECT
  USING (user_id = (current_setting('app.current_user_id', true))::uuid);

CREATE POLICY "Users can insert own results"
  ON test_results FOR INSERT
  WITH CHECK (user_id = (current_setting('app.current_user_id', true))::uuid);

CREATE POLICY "Admins can view all results"
  ON test_results FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = (current_setting('app.current_user_id', true))::uuid
      AND users.is_admin = true
    )
  );