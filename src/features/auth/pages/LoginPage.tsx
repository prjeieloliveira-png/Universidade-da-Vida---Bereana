import { GraduationCap } from 'lucide-react';
import { LoginForm } from '../components/LoginForm';

export function LoginPage() {
  return (
    <div className="min-h-screen bg-[#f4f6f8] flex flex-col justify-center items-center p-4 sm:p-6">
      <div className="w-full max-w-sm bg-white rounded-[32px] shadow-sm border border-slate-200/70 p-6 sm:p-8">
        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-[#58bc75] text-white rounded-[22px] flex items-center justify-center mx-auto mb-3 shadow-sm shadow-[#58bc75]/20">
            <GraduationCap className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Universidade da Vida
          </h1>
          <p className="text-xs font-medium text-slate-400 mt-1">
            Igreja Bereana • Portal da Liderança
          </p>
        </div>

        <LoginForm />

        <div className="mt-6 pt-4 border-t border-slate-100 text-center">
          <span className="inline-block px-3 py-1 bg-slate-100 text-slate-500 text-[11px] font-medium rounded-full">
            Coordenação & Líderes de Rede
          </span>
        </div>
      </div>
    </div>
  );
}
