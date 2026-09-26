import { LoginForm } from '../components/LoginForm';

export function LoginPage() {
  return (
    <div className="min-h-screen bg-[#f4f6f8] flex flex-col justify-center items-center p-4 sm:p-6">
      <div className="w-full max-w-sm bg-white rounded-[32px] shadow-sm border border-slate-200/70 p-6 sm:p-8">
        <div className="text-center mb-6 flex flex-col items-center">
          <img
            src="/logo-uv.png"
            alt="Universidade da Vida"
            className="h-28 w-auto object-contain mx-auto mb-2"
          />
          <p className="text-xs font-semibold text-slate-400">
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
