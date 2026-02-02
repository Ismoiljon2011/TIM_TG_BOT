export interface User {
  id: string;
  username: string;
  is_admin: boolean;
  created_at: string;
}

export interface Test {
  id: string;
  title: string;
  description: string;
  duration_minutes: number;
  created_by: string;
  created_at: string;
}

export interface Question {
  id: string;
  test_id: string;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: string;
  created_at: string;
}

export interface TestResult {
  id: string;
  user_id: string;
  test_id: string;
  score: number;
  total_questions: number;
  started_at: string;
  completed_at: string;
}
