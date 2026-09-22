import { Loader2 } from 'lucide-react';

interface LoadingStateProps {
  message?: string;
  fullScreen?: boolean;
}

export function LoadingSpinner({
  message = 'Carregando...',
  fullScreen = false,
}: LoadingStateProps) {
  if (fullScreen) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-50">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mb-3" />
        <p className="text-sm font-medium text-slate-600 animate-pulse">{message}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <Loader2 className="w-6 h-6 text-indigo-600 animate-spin mb-2" />
      <p className="text-xs text-slate-500">{message}</p>
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs animate-pulse">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-full bg-slate-200" />
        <div className="flex-1">
          <div className="h-4 bg-slate-200 rounded-md w-3/4 mb-1.5" />
          <div className="h-3 bg-slate-100 rounded-md w-1/2" />
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-3 bg-slate-100 rounded-md w-full" />
        <div className="h-3 bg-slate-100 rounded-md w-5/6" />
      </div>
    </div>
  );
}
