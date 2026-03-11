import { Outlet } from 'react-router-dom';
import { NavBar } from '../components/NavBar';

export function PublicLayout() {
  return (
    <div className="public-shell">
      <NavBar />
      <main className="container">
        <Outlet />
      </main>
    </div>
  );
}
