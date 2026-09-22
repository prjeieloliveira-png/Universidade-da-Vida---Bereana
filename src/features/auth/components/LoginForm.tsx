import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, LogIn, AlertCircle } from 'lucide-react';
import { supabase } from '@/shared/lib/supabase';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        setErrorMsg(
          error.message === 'Invalid login credentials'
            ? 'E-mail ou senha incorretos.'
            : error.message
        );
      } else {
        navigate('/dashboard');
      }
    } catch {
      setErrorMsg('Falha ao conectar ao servidor. Verifique sua conexão.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleLogin} className="space-y-4 w-full">
      {errorMsg && (
        <div className="p-3.5 bg-rose-50 border border-rose-200/80 rounded-2xl flex items-center gap-2.5 text-xs text-rose-700">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1.5" htmlFor="email-input">
          E-mail
        </label>
        <div className="relative">
          <Mail className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            id="email-input"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="seu.email@igreja.com"
            className="w-full pl-11 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200/80 rounded-full focus:outline-none focus:ring-2 focus:ring-[#58bc75] focus:bg-white transition-all text-slate-900 placeholder:text-slate-400"
          />
        </div>
      </div>

      <div>
        <label
          className="block text-xs font-semibold text-slate-700 mb-1.5"
          htmlFor="password-input"
        >
          Senha
        </label>
        <div className="relative">
          <Lock className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            id="password-input"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full pl-11 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200/80 rounded-full focus:outline-none focus:ring-2 focus:ring-[#58bc75] focus:bg-white transition-all text-slate-900 placeholder:text-slate-400"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        id="btn-login-submit"
        className="w-full py-3 px-5 bg-[#58bc75] hover:bg-[#4caa68] active:bg-[#419a5c] disabled:opacity-60 text-white font-bold text-sm rounded-full flex items-center justify-center gap-2 transition-colors shadow-sm shadow-[#58bc75]/25 cursor-pointer mt-2"
      >
        {loading ? (
          <span>Entrando...</span>
        ) : (
          <>
            <LogIn className="w-4 h-4" />
            <span>Acessar o Sistema</span>
          </>
        )}
      </button>
    </form>
  );
}
