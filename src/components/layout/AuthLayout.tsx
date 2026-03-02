import { Outlet } from 'react-router-dom';
import { Header } from './Header';

export function AuthLayout() {
  return (
    <div className="flex h-screen flex-col bg-slate-50">
      <Header />
      <main className="flex flex-1 overflow-hidden">
        <Outlet />
      </main>
    </div>
  );
}
