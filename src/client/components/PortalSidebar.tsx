import { Link } from 'react-router-dom';
import type { Role } from '../lib/types';

const allNav = [
  ['Dashboard', '/portal'],
  ['Projects', '/portal/projects'],
  ['Tasks / Milestones', '/portal/tasks'],
  ['Support Tickets', '/portal/tickets'],
  ['License Key Management', '/portal/licenses'],
  ['Downloads Center', '/portal/downloads'],
  ['Document Management', '/portal/documents'],
  ['Commissioning Tracking', '/portal/commissioning'],
  ['Clients / Companies', '/portal/clients'],
  ['Users / Roles', '/portal/users'],
  ['Activity Logs', '/portal/audit'],
  ['Announcements', '/portal/announcements']
] as const;

const roleHidden: Partial<Record<Role, string[]>> = {
  client_user: ['/portal/users', '/portal/audit', '/portal/clients'],
  installer: ['/portal/licenses', '/portal/users']
};

export function PortalSidebar({ role }: { role: Role }) {
  const hidden = new Set(roleHidden[role] ?? []);
  return (
    <aside className="sidebar">
      {allNav
        .filter(([, path]) => !hidden.has(path))
        .map(([label, path]) => (
          <Link key={path} to={path}>
            {label}
          </Link>
        ))}
    </aside>
  );
}
