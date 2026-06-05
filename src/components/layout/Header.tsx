import { BarChart3, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';

export function Header() {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuthStore();

  const handleLogout = async () => {
    await logout();
    localStorage.removeItem('zele-workspace');
    navigate('/login', { replace: true });
  };

  return (
    <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center justify-between border-b border-white/70 bg-white/85 px-4 shadow-sm shadow-slate-900/5 backdrop-blur md:px-6">
      <div className="flex items-center gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-primary-700 text-white shadow-sm shadow-primary-900/20">
          <BarChart3 className="h-5 w-5" />
        </span>
        <div>
          <p className="text-sm font-bold tracking-tight text-primary-950">Zele</p>
          <p className="text-xs font-medium text-slate-500">Modelos Econométricos</p>
        </div>
      </div>

      {isAuthenticated && user && (
        <div className="flex items-center gap-2 md:gap-4">
          <span className="hidden rounded-full bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-600 sm:inline">
            {user.name}
          </span>
          <button
            onClick={handleLogout}
            className="rounded-xl border border-slate-200 bg-white p-2 text-slate-500 shadow-sm transition-all hover:border-slate-300 hover:bg-slate-50 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
            title="Cerrar sesión"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      )}
    </header>
  );
}
