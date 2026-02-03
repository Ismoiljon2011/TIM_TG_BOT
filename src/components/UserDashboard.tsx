import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Test, Question, TestResult } from '../types';
import { BookOpen, Clock, Award, LogOut, Play, ChevronRight, Menu, X, Send, MessageCircle } from 'lucide-react';

export default function UserDashboard() {
  const { user, logout } = useAuth();
  const [tests, setTests] = useState<Test[]>([]);
  const [results, setResults] = useState<TestResult[]>([]);
  const [activeTest, setActiveTest] = useState<Test | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [testStartTime, setTestStartTime] = useState<Date | null>(null);
  const [completedResult, setCompletedResult] = useState<{ score: number; total: number } | null>(null);
  const [showCommandMenu, setShowCommandMenu] = useState(false);

  const botCommands = [
    { command: '/start', description: 'Menyni ko\'rish' },
    { command: '/login', description: 'Login qilish' },
    { command: '/password', description: 'Parolni o\'zgartirish' },
    { command: '/forgot', description: 'Parolni esidan chiqarish' },
    { command: '/profile', description: 'Profilni ko\'rish' },
  ];

  useEffect(() => {
    loadTests();
    loadResults();
  }, [user]);

  useEffect(() => {
    if (activeTest && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleSubmitTest();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [activeTest, timeLeft]);

  const loadTests = async () => {
    const { data } = await supabase
      .from('tests')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setTests(data);
  };

  const loadResults = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('test_results')
      .select('*')
      .eq('user_id', user.id)
      .order('completed_at', { ascending: false });
    if (data) setResults(data);
  };

  const startTest = async (test: Test) => {
    const { data } = await supabase
      .from('questions')
      .select('*')
      .eq('test_id', test.id)
      .order('created_at', { ascending: true });

    if (data && data.length > 0) {
      setActiveTest(test);
      setQuestions(data);
      setCurrentQuestionIndex(0);
      setAnswers({});
      setTimeLeft(test.duration_minutes * 60);
      setTestStartTime(new Date());
    } else {
      alert('Bu testda savollar yo\'q');
    }
  };

  const handleAnswer = (questionId: string, answer: string) => {
    setAnswers({ ...answers, [questionId]: answer });
  };

  const handleSubmitTest = async () => {
    if (!activeTest || !user || !testStartTime) return;

    let score = 0;
    questions.forEach((q) => {
      if (answers[q.id] === q.correct_answer) {
        score++;
      }
    });

    await supabase.from('test_results').insert([{
      user_id: user.id,
      test_id: activeTest.id,
      score,
      total_questions: questions.length,
      started_at: testStartTime.toISOString(),
      completed_at: new Date().toISOString()
    }]);

    setCompletedResult({ score, total: questions.length });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleBackToTests = () => {
    setActiveTest(null);
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setAnswers({});
    setTimeLeft(0);
    setTestStartTime(null);
    setCompletedResult(null);
    loadResults();
  };

  if (completedResult && activeTest) {
    const percentage = Math.round((completedResult.score / completedResult.total) * 100);
    const isPassed = percentage >= 70;

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="max-w-4xl mx-auto px-4 py-8 flex items-center justify-center min-h-screen">
          <div className="bg-white rounded-xl shadow-2xl p-12 text-center max-w-md w-full">
            <div className={`w-16 h-16 rounded-full mx-auto mb-6 flex items-center justify-center ${
              isPassed ? 'bg-green-100' : 'bg-yellow-100'
            }`}>
              <div className={`text-4xl ${isPassed ? 'text-green-600' : 'text-yellow-600'}`}>
                {isPassed ? '✓' : '!'}
              </div>
            </div>

            <h2 className="text-3xl font-bold text-gray-800 mb-2">Test yakunlandi</h2>
            <p className="text-gray-600 mb-8">{activeTest.title}</p>

            <div className="mb-8">
              <div className="text-5xl font-bold text-blue-600 mb-2">
                {completedResult.score}/{completedResult.total}
              </div>
              <p className="text-gray-600 mb-4">to'g'ri javob</p>
              <div className="inline-block px-6 py-2 rounded-full font-semibold"
                style={{
                  backgroundColor: isPassed ? '#dcfce7' : '#fef3c7',
                  color: isPassed ? '#166534' : '#92400e'
                }}>
                {percentage}%
              </div>
            </div>

            {isPassed && (
              <p className="text-green-600 font-semibold mb-6">Tabriklaymiz! Siz testni muvaffaqiyatli yakunladingiz!</p>
            )}

            <button
              onClick={handleBackToTests}
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
            >
              Testlar ro'yxatiga qaytish
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (activeTest && questions.length > 0) {
    const currentQuestion = questions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-white rounded-xl shadow-xl p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-800">{activeTest.title}</h2>
              <div className="flex items-center gap-2 text-red-600 font-semibold text-lg">
                <Clock className="w-5 h-5" />
                {formatTime(timeLeft)}
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-sm text-gray-600">
              Savol {currentQuestionIndex + 1} / {questions.length}
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-xl p-8">
            <h3 className="text-xl font-semibold text-gray-800 mb-6">
              {currentQuestion.question_text}
            </h3>

            <div className="space-y-3 mb-8">
              {['a', 'b', 'c', 'd'].map((option) => {
                const optionText = currentQuestion[`option_${option}` as keyof Question] as string;
                const isSelected = answers[currentQuestion.id] === option;

                return (
                  <button
                    key={option}
                    onClick={() => handleAnswer(currentQuestion.id, option)}
                    className={`w-full text-left p-4 border-2 rounded-lg transition ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    <span className="font-semibold text-gray-700">
                      {option.toUpperCase()})
                    </span>{' '}
                    {optionText}
                  </button>
                );
              })}
            </div>

            <div className="flex justify-between">
              <button
                onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
                disabled={currentQuestionIndex === 0}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                Orqaga
              </button>

              {currentQuestionIndex === questions.length - 1 ? (
                <button
                  onClick={handleSubmitTest}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2"
                >
                  Testni yakunlash
                </button>
              ) : (
                <button
                  onClick={() => setCurrentQuestionIndex(currentQuestionIndex + 1)}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
                >
                  Keyingi
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">Test Platformasi</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">Foydalanuvchi: {user?.username}</span>
            <div className="relative">
              <button
                onClick={() => setShowCommandMenu(!showCommandMenu)}
                className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
                title="Telegram bot komandalar"
              >
                <Menu className="w-5 h-5" />
              </button>

              {showCommandMenu && (
                <div className="absolute right-0 mt-2 w-72 bg-white border border-gray-200 rounded-lg shadow-xl z-50">
                  <div className="p-4 border-b border-gray-200">
                    <div className="flex items-center gap-2 mb-2">
                      <MessageCircle className="w-5 h-5 text-blue-600" />
                      <h3 className="font-bold text-gray-800">Telegram Bot Komandalar</h3>
                    </div>
                    <p className="text-sm text-gray-600">Botni ishlatish uchun quyidagi komandalardan foydalaning</p>
                  </div>
                  <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
                    {botCommands.map((cmd, idx) => (
                      <div key={idx} className="p-4 hover:bg-gray-50 transition">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <p className="font-mono text-sm font-semibold text-blue-600">{cmd.command}</p>
                            <p className="text-sm text-gray-600 mt-1">{cmd.description}</p>
                          </div>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(cmd.command);
                              setShowCommandMenu(false);
                            }}
                            className="p-1 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition"
                            title="Nusxalash"
                          >
                            <Send className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="p-3 bg-blue-50 border-t border-gray-200 text-xs text-gray-600">
                    <p className="font-semibold mb-1">💡 Bot nomi:</p>
                    <p className="font-mono text-blue-600">@YourBotName</p>
                  </div>
                </div>
              )}
            </div>
            <button
              onClick={logout}
              className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition"
            >
              <LogOut className="w-4 h-4" />
              Chiqish
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
              <div className="flex items-center gap-2 mb-6">
                <BookOpen className="w-6 h-6 text-blue-600" />
                <h2 className="text-xl font-bold text-gray-800">Mavjud Testlar</h2>
              </div>

              <div className="space-y-4">
                {tests.map((test) => (
                  <div
                    key={test.id}
                    className="p-6 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md transition"
                  >
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">{test.title}</h3>
                    <p className="text-gray-600 mb-4">{test.description}</p>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Clock className="w-4 h-4" />
                        {test.duration_minutes} daqiqa
                      </div>
                      <button
                        onClick={() => startTest(test)}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                      >
                        <Play className="w-4 h-4" />
                        Boshlash
                      </button>
                    </div>
                  </div>
                ))}

                {tests.length === 0 && (
                  <p className="text-center text-gray-500 py-8">Hozircha testlar yo'q</p>
                )}
              </div>
            </div>
          </div>

          <div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-4">
              <div className="flex items-center gap-2 mb-6">
                <Award className="w-6 h-6 text-yellow-600" />
                <h2 className="text-xl font-bold text-gray-800">Natijalar</h2>
              </div>

              <div className="space-y-3">
                {results.slice(0, 5).map((result) => {
                  const test = tests.find((t) => t.id === result.test_id);
                  const percentage = Math.round((result.score / result.total_questions) * 100);

                  return (
                    <div key={result.id} className="p-4 bg-gray-50 rounded-lg">
                      <p className="font-semibold text-gray-800 mb-1">{test?.title}</p>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">
                          {result.score}/{result.total_questions}
                        </span>
                        <span
                          className={`text-sm font-semibold ${
                            percentage >= 70 ? 'text-green-600' : percentage >= 50 ? 'text-yellow-600' : 'text-red-600'
                          }`}
                        >
                          {percentage}%
                        </span>
                      </div>
                    </div>
                  );
                })}

                {results.length === 0 && (
                  <p className="text-center text-gray-500 py-4">Natijalar yo'q</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
