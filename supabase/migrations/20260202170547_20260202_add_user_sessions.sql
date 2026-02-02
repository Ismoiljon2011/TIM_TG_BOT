/*
  # Add user sessions tracking for Telegram bot

  1. New Tables
    - `user_sessions` - Tracks active Telegram user sessions
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users)
      - `telegram_id` (integer, unique)
      - `session_state` (text) - Current state: 'idle', 'awaiting_login', 'awaiting_password_change'
      - `created_at` (timestamp)
      - `last_activity` (timestamp)

  2. Security
    - Enable RLS on `user_sessions` table
    - Add policies to allow edge functions to manage sessions
*/

CREATE TABLE IF NOT EXISTS user_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  telegram_id bigint UNIQUE NOT NULL,
  session_state text DEFAULT 'idle',
  created_at timestamptz DEFAULT now(),
  last_activity timestamptz DEFAULT now()
);

ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can manage sessions"
  ON user_sessions
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);