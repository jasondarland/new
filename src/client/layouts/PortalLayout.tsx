import { Outlet } from 'react-router-dom';
import { PortalSidebar } from '../components/PortalSidebar';
import type { SessionUser } from '../lib/types';

export function PortalLayout({ user }: { user: SessionUser }) {
  return (
    <div className="portal-shell">
      <PortalSidebar role={user.role} />
      <section className="portal-content">
        <header>
          <h1>SSI Command Center</h1>
          <p>{user.fullName}</p>
        </header>
        <Outlet />
      </section>
    </div>
  );
}
