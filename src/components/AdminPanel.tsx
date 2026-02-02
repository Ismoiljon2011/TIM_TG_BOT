import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Test, Question, TestResult } from '../types';
import { Plus, Edit2, Trash2, LogOut, BookOpen, HelpCircle, BarChart3 } from 'lucide-react';

export default function AdminPanel() {
  const { user, logout } = useAuth();
  const [tests, setTests] = useState<Test[]>([]);
  const [selectedTest, setSelectedTest] = useState<Test | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [showTestForm, setShowTestForm] = useState(false);
  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [testForm, setTestForm] = useState({ title: '', description: '', duration_minutes: 30 });
  const [questionForm, setQuestionForm] = useState({
    question_text: '',
    option_a: '',
    option_b: '',
    option_c: '',
    option_d: '',
    correct_answer: 'a'
  });
  const [error, setError] = useState<string>('');
  const [deleteConfirmTest, setDeleteConfirmTest] = useState<string | null>(null);
  const [deleteConfirmQuestion, setDeleteConfirmQuestion] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [usersMap, setUsersMap] = useState<Record<string, string>>({});

  useEffect(() => {
    loadTests();
  }, []);

  useEffect(() => {
    if (selectedTest) {
      loadQuestions(selectedTest.id);
      loadResults(selectedTest.id);
      loadUsersMap();
    }
  }, [selectedTest]);

  const loadTests = async () => {
    const { data } = await supabase
      .from('tests')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setTests(data);
  };

  const loadQuestions = async (testId: string) => {
    const { data } = await supabase
      .from('questions')
      .select('*')
      .eq('test_id', testId)
      .order('created_at', { ascending: true });
    if (data) setQuestions(data);
  };

  const loadResults = async (testId: string) => {
    const { data } = await supabase
      .from('test_results')
      .select('*')
      .eq('test_id', testId)
      .order('completed_at', { ascending: false });
    if (data) setTestResults(data);
  };

  const loadUsersMap = async () => {
    const { data } = await supabase
      .from('users')
      .select('id, username');
    if (data) {
      const map: Record<string, string> = {};
      data.forEach(user => {
        map[user.id] = user.username;
      });
      setUsersMap(map);
    }
  };

  const handleCreateTest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.is_admin) {
      setError('Faqat admin test qo\'sha oladi');
      return;
    }
    const { error: err } = await supabase.from('tests').insert([{ ...testForm, created_by: user?.id }]);
    if (err) {
      setError(err.message);
      return;
    }
    setError('');
    setTestForm({ title: '', description: '', duration_minutes: 30 });
    setShowTestForm(false);
    loadTests();
  };

  const handleDeleteTest = async (id: string) => {
    if (!user?.is_admin) {
      setError('Faqat admin test o\'cha oladi');
      return;
    }
    const { error: err } = await supabase.from('tests').delete().eq('id', id);
    if (err) {
      setError(err.message);
      return;
    }
    setError('');
    if (selectedTest?.id === id) {
      setSelectedTest(null);
      setQuestions([]);
    }
    loadTests();
    setDeleteConfirmTest(null);
  };

  const handleCreateQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.is_admin) {
      setError('Faqat admin savol qo\'sha oladi');
      return;
    }
    if (!selectedTest) return;
    const { error: err } = await supabase.from('questions').insert([{ ...questionForm, test_id: selectedTest.id }]);
    if (err) {
      setError(err.message);
      return;
    }
    setError('');
    setQuestionForm({
      question_text: '',
      option_a: '',
      option_b: '',
      option_c: '',
      option_d: '',
      correct_answer: 'a'
    });
    setShowQuestionForm(false);
    loadQuestions(selectedTest.id);
  };

  const handleDeleteQuestion = async (id: string) => {
    if (!user?.is_admin) {
      setError('Faqat admin savol o\'cha oladi');
      return;
    }
    const { error: err } = await supabase.from('questions').delete().eq('id', id);
    if (err) {
      setError(err.message);
      return;
    }
    setError('');
    if (selectedTest) loadQuestions(selectedTest.id);
    setDeleteConfirmQuestion(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">Admin Panel</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">Admin: {user?.username}</span>
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
        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg flex justify-between items-center">
            <span>{error}</span>
            <button
              onClick={() => setError('')}
              className="text-red-600 hover:text-red-800"
            >
              ×
            </button>
          </div>
        )}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-blue-600" />
                  <h2 className="text-xl font-bold text-gray-800">Testlar</h2>
                </div>
                <button
                  onClick={() => setShowTestForm(!showTestForm)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  <Plus className="w-4 h-4" />
                  Yangi test
                </button>
              </div>

              {showTestForm && (
                <form onSubmit={handleCreateTest} className="mb-6 p-4 bg-blue-50 rounded-lg space-y-4">
                  <input
                    type="text"
                    placeholder="Test nomi"
                    value={testForm.title}
                    onChange={(e) => setTestForm({ ...testForm, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                  <textarea
                    placeholder="Test tavsifi"
                    value={testForm.description}
                    onChange={(e) => setTestForm({ ...testForm, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                  />
                  <input
                    type="number"
                    placeholder="Davomiyligi (daqiqa)"
                    value={testForm.duration_minutes}
                    onChange={(e) => setTestForm({ ...testForm, duration_minutes: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                  <div className="flex gap-2">
                    <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                      Saqlash
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowTestForm(false)}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                    >
                      Bekor qilish
                    </button>
                  </div>
                </form>
              )}

              <div className="space-y-3">
                {tests.map((test) => (
                  <div
                    key={test.id}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition ${
                      selectedTest?.id === test.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                    onClick={() => setSelectedTest(test)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-800">{test.title}</h3>
                        <p className="text-sm text-gray-600 mt-1">{test.description}</p>
                        <p className="text-xs text-gray-500 mt-2">{test.duration_minutes} daqiqa</p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteConfirmTest(test.id);
                        }}
                        className="text-red-500 hover:text-red-700 p-2"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-green-600" />
                  <h2 className="text-xl font-bold text-gray-800">Savollar</h2>
                </div>
                {selectedTest && (
                  <button
                    onClick={() => setShowQuestionForm(!showQuestionForm)}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                  >
                    <Plus className="w-4 h-4" />
                    Yangi savol
                  </button>
                )}
              </div>

              {!selectedTest ? (
                <p className="text-gray-500 text-center py-8">Testni tanlang</p>
              ) : (
                <>
                  {showQuestionForm && (
                    <form onSubmit={handleCreateQuestion} className="mb-6 p-4 bg-green-50 rounded-lg space-y-4">
                      <textarea
                        placeholder="Savol matni"
                        value={questionForm.question_text}
                        onChange={(e) => setQuestionForm({ ...questionForm, question_text: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        rows={3}
                        required
                      />
                      <input
                        type="text"
                        placeholder="A) variant"
                        value={questionForm.option_a}
                        onChange={(e) => setQuestionForm({ ...questionForm, option_a: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        required
                      />
                      <input
                        type="text"
                        placeholder="B) variant"
                        value={questionForm.option_b}
                        onChange={(e) => setQuestionForm({ ...questionForm, option_b: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        required
                      />
                      <input
                        type="text"
                        placeholder="C) variant"
                        value={questionForm.option_c}
                        onChange={(e) => setQuestionForm({ ...questionForm, option_c: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        required
                      />
                      <input
                        type="text"
                        placeholder="D) variant"
                        value={questionForm.option_d}
                        onChange={(e) => setQuestionForm({ ...questionForm, option_d: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        required
                      />
                      <select
                        value={questionForm.correct_answer}
                        onChange={(e) => setQuestionForm({ ...questionForm, correct_answer: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      >
                        <option value="a">To'g'ri javob: A</option>
                        <option value="b">To'g'ri javob: B</option>
                        <option value="c">To'g'ri javob: C</option>
                        <option value="d">To'g'ri javob: D</option>
                      </select>
                      <div className="flex gap-2">
                        <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition">
                          Saqlash
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowQuestionForm(false)}
                          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                        >
                          Bekor qilish
                        </button>
                      </div>
                    </form>
                  )}

                  <div className="space-y-4">
                    {questions.map((question, index) => (
                      <div key={question.id} className="p-4 border border-gray-200 rounded-lg">
                        <div className="flex justify-between items-start mb-3">
                          <h4 className="font-semibold text-gray-800">
                            {index + 1}. {question.question_text}
                          </h4>
                          <button
                            onClick={() => setDeleteConfirmQuestion(question.id)}
                            className="text-red-500 hover:text-red-700 p-2"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="space-y-2 text-sm">
                          <p className={question.correct_answer === 'a' ? 'text-green-600 font-medium' : 'text-gray-600'}>
                            A) {question.option_a}
                          </p>
                          <p className={question.correct_answer === 'b' ? 'text-green-600 font-medium' : 'text-gray-600'}>
                            B) {question.option_b}
                          </p>
                          <p className={question.correct_answer === 'c' ? 'text-green-600 font-medium' : 'text-gray-600'}>
                            C) {question.option_c}
                          </p>
                          <p className={question.correct_answer === 'd' ? 'text-green-600 font-medium' : 'text-gray-600'}>
                            D) {question.option_d}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          <div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-6">
                <BarChart3 className="w-5 h-5 text-purple-600" />
                <h2 className="text-xl font-bold text-gray-800">Natijalar</h2>
              </div>

              {!selectedTest ? (
                <p className="text-gray-500 text-center py-8">Testni tanlang</p>
              ) : testResults.length === 0 ? (
                <p className="text-gray-500 text-center py-8">Hali natija yo'q</p>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {testResults.map((result) => (
                    <div key={result.id} className="p-3 border border-gray-200 rounded-lg bg-gray-50">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-semibold text-gray-800">
                            {usersMap[result.user_id] || 'Noma\'lum foydalanuvchi'}
                          </p>
                          <p className="text-sm text-gray-600">
                            {result.score}/{result.total_questions}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-blue-600">
                            {Math.round((result.score / result.total_questions) * 100)}%
                          </p>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500">
                        {new Date(result.completed_at).toLocaleDateString('uz-UZ', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {deleteConfirmTest && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-sm w-full p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Testni o'chirish</h3>
              <p className="text-gray-600 mb-6">Bu testni o'chirishni xohlaysizmi? Bu amalni qaytarib bolmaydi.</p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setDeleteConfirmTest(null)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-medium"
                >
                  Bekor qilish
                </button>
                <button
                  onClick={() => handleDeleteTest(deleteConfirmTest)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium"
                >
                  O'chirish
                </button>
              </div>
            </div>
          </div>
        )}

        {deleteConfirmQuestion && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-sm w-full p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Savolni o'chirish</h3>
              <p className="text-gray-600 mb-6">Bu savolni o'chirishni xohlaysizmi? Bu amalni qaytarib bolmaydi.</p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setDeleteConfirmQuestion(null)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-medium"
                >
                  Bekor qilish
                </button>
                <button
                  onClick={() => handleDeleteQuestion(deleteConfirmQuestion)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium"
                >
                  O'chirish
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
