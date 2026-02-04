import { useState } from 'react';
import { BookOpen, MessageCircle, Users, Zap, ArrowRight, CheckCircle } from 'lucide-react';

interface HomePageProps {
  onLoginClick: () => void;
}

export default function HomePage({ onLoginClick }: HomePageProps) {
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null);

  const features = [
    {
      icon: BookOpen,
      title: 'Interaktiv Testlar',
      description: 'Sifatli tuzilgan testlar bilan bilimingizni sinab ko\'ring',
    },
    {
      icon: Zap,
      title: 'Real vaqtda Natijalar',
      description: 'Darhol natijalar qabul qiling va tahlil foydalaning',
    },
    {
      icon: Users,
      title: 'Telegram Bot',
      description: 'Telegram orqali istalgan joydan testlarga kirish',
    },
    {
      icon: MessageCircle,
      title: 'Oson Interfeys',
      description: 'Sodda va intuitiv dizayn - hamma uchun qulay',
    },
  ];

  const stats = [
    { number: '100+', label: 'Testlar' },
    { number: '1000+', label: 'Foydalanuvchilar' },
    { number: '50k+', label: 'Muallif' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      <nav className="fixed w-full top-0 bg-slate-900/80 backdrop-blur-md border-b border-slate-700/50 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
                Test Platform
              </h1>
            </div>
            <button
              onClick={onLoginClick}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition transform hover:scale-105"
            >
              Kirish
            </button>
          </div>
        </div>
      </nav>

      <div className="pt-32 pb-16 px-4">
        <div className="max-w-7xl mx-auto text-center mb-20">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            <span className="text-white">Bilimingizni </span>
            <span className="bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 bg-clip-text text-transparent">
              Sinab Ko'ring
            </span>
          </h1>
          <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto leading-relaxed">
            Komprehensiv test platformasi bilan ilmiy salohiyatingizni oshiring. Telegram bot orqali istalgan joydan testlarga kirishni boshlang.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={onLoginClick}
              className="px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg font-semibold flex items-center justify-center gap-2 transition transform hover:scale-105"
            >
              Testlarni Boshlash
              <ArrowRight className="w-5 h-5" />
            </button>
            <button
              onClick={onLoginClick}
              className="px-8 py-4 border-2 border-slate-600 hover:border-blue-500 text-slate-300 hover:text-blue-400 rounded-lg font-semibold transition"
            >
              Bot haqida Ko'proq
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {stats.map((stat, idx) => (
            <div key={idx} className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 text-center hover:border-blue-500/50 transition">
              <div className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent mb-2">
                {stat.number}
              </div>
              <p className="text-slate-400">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <div
                key={idx}
                onMouseEnter={() => setHoveredFeature(idx)}
                onMouseLeave={() => setHoveredFeature(null)}
                className={`p-6 rounded-xl border transition-all duration-300 ${
                  hoveredFeature === idx
                    ? 'bg-slate-700/50 border-blue-500 shadow-lg shadow-blue-500/20 transform scale-105'
                    : 'bg-slate-800/30 border-slate-700/50'
                }`}
              >
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 transition ${
                  hoveredFeature === idx
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-700 text-blue-400'
                }`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-slate-400 text-sm">{feature.description}</p>
              </div>
            );
          })}
        </div>

        <div className="bg-gradient-to-r from-blue-600/20 to-blue-500/20 border border-blue-500/30 rounded-2xl p-12 text-center mb-16">
          <h2 className="text-3xl font-bold text-white mb-6">Telegram Bot orqali kirish</h2>
          <p className="text-slate-300 mb-8 max-w-2xl mx-auto">
            @YourBotName ga /start komandasi yuborib testlarni boshlang. Xavfsiz va tezkor ro'yxatdan o'tish jarayoni.
          </p>
          <div className="flex justify-center">
            <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-6 max-w-md w-full">
              <p className="text-sm text-slate-400 mb-3">Bot komandalar:</p>
              <div className="space-y-2 text-left">
                {['/start - Ro\'yxatdan o\'tish', '/login - Kirish', '/password - Parolni o\'zgartirish', '/forgot - Parolni tiklash'].map((cmd, i) => (
                  <div key={i} className="flex items-center gap-2 text-slate-300">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="font-mono text-sm">{cmd}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="text-center">
          <p className="text-slate-500 text-sm mb-4">Hozir boshlang va yuqori natijalar oling</p>
          <button
            onClick={onLoginClick}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition inline-flex items-center gap-2"
          >
            <MessageCircle className="w-5 h-5" />
            Testlarni Boshlash
          </button>
        </div>
      </div>

      <footer className="border-t border-slate-700/50 bg-slate-900/50 backdrop-blur mt-20 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-slate-500 text-sm">
          <p>&copy; 2024 Test Platform. Barcha huquqlar himoyalangan.</p>
        </div>
      </footer>
    </div>
  );
}
