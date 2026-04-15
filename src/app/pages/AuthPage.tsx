import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';

export default function AuthPage() {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    if (mode === 'login') {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setError(error.message);
    } else {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) {
        setError(error.message);
      } else {
        setMessage('Проверь почту — мы отправили письмо для подтверждения.');
      }
    }

    setLoading(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f5f0eb] px-6">
      <div className="w-full max-w-sm">
        <h1 className="text-3xl font-bold text-center mb-2 tracking-tight">Polka</h1>
        <p className="text-center text-sm text-gray-500 mb-8">Твоя книжная полка</p>

        <div className="flex rounded-full bg-gray-200 p-1 mb-6">
          <button
            className={`flex-1 rounded-full py-1.5 text-sm font-medium transition-colors ${mode === 'login' ? 'bg-white shadow text-black' : 'text-gray-500'}`}
            onClick={() => { setMode('login'); setError(null); setMessage(null); }}
          >
            Войти
          </button>
          <button
            className={`flex-1 rounded-full py-1.5 text-sm font-medium transition-colors ${mode === 'register' ? 'bg-white shadow text-black' : 'text-gray-500'}`}
            onClick={() => { setMode('register'); setError(null); setMessage(null); }}
          >
            Зарегистрироваться
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-black transition-colors"
          />
          <input
            type="password"
            placeholder="Пароль"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            minLength={6}
            className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-black transition-colors"
          />

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          {message && <p className="text-green-600 text-sm text-center">{message}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-black text-white py-3 text-sm font-medium disabled:opacity-50 transition-opacity"
          >
            {loading ? 'Загрузка...' : mode === 'login' ? 'Войти' : 'Зарегистрироваться'}
          </button>
        </form>
      </div>
    </div>
  );
}
