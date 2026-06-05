import { Outlet } from 'react-router-dom';
import { Header } from './Header';

export function AuthLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
