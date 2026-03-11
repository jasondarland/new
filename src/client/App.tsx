import { Navigate, Route, Routes } from 'react-router-dom';
import { PublicLayout } from './layouts/PublicLayout';
import { PortalLayout } from './layouts/PortalLayout';
import { useQuery } from '@tanstack/react-query';
import { fetchSession } from './lib/api';

const Mk = ({ title, text }: { title: string; text: string }) => (
  <article className="panel"><h2>{title}</h2><p>{text}</p></article>
);

function PublicRoutes() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Mk title="Engineering immersive attractions." text="Show Systems International designs advanced attraction control platforms for global venues." />} />
        <Route path="/about" element={<Mk title="About SSI" text="Enterprise-grade attraction technology partner for operators, integrators, and OEMs." />} />
        <Route path="/products" element={<Mk title="Products" text="Explore IMMERSE™ and TITAN™ control platforms." />} />
        <Route path="/products/immerse" element={<Mk title="IMMERSE™" text="Show control orchestration for immersive media attractions." />} />
        <Route path="/products/titan" element={<Mk title="TITAN™" text="Mission-critical ride and effects control at industrial scale." />} />
        <Route path="/solutions" element={<Mk title="Solutions" text="Full lifecycle delivery: design, commissioning, support, and optimization." />} />
        <Route path="/support" element={<Mk title="Support" text="SLA-driven support with diagnostics, ticketing, and remote intervention." />} />
        <Route path="/contact" element={<Mk title="Contact SSI" text="Turnstile-protected enterprise inquiry form and sales routing." />} />
        <Route path="/portal-login" element={<Mk title="Portal Login" text="Secure login with invitation flow, reset, and Turnstile." />} />
      </Route>
    </Routes>
  );
}

export function App() {
  const session = useQuery({ queryKey: ['me'], queryFn: fetchSession, retry: false });
  const user = session.data?.user;

  if (!user) return <PublicRoutes />;

  return (
    <Routes>
      <Route path="/portal" element={<PortalLayout user={user} />}>
        <Route index element={<Mk title="Dashboard" text="KPIs, open risks, milestone burn-down, and SLA alerts." />} />
        <Route path="projects" element={<Mk title="Projects" text="Overview, milestones, tasks, contacts, docs, downloads, licenses, tickets, commissioning, and activity feed." />} />
        <Route path="tasks" element={<Mk title="Tasks / Milestones" text="Cross-project task board, owner filters, dependencies, and due-date warnings." />} />
        <Route path="tickets" element={<Mk title="Support Tickets" text="Priority, assignment, internal notes, attachments, and SLA indicators." />} />
        <Route path="licenses" element={<Mk title="License Keys" text="Generate, assign, activate/deactivate/revoke/reissue with full audit history." />} />
        <Route path="downloads" element={<Mk title="Downloads Center" text="Entitlement-based manuals, firmware, installers, and release notes." />} />
        <Route path="documents" element={<Mk title="Document Management" text="R2-backed secure documents with role and visibility controls." />} />
        <Route path="commissioning" element={<Mk title="Commissioning Tracking" text="Installation checklist with sign-off trail and readiness status." />} />
        <Route path="clients" element={<Mk title="Client Management" text="Companies, contacts, contracts, and account ownership." />} />
        <Route path="users" element={<Mk title="User / Role Admin" text="RBAC administration with invitation and password reset flows." />} />
        <Route path="audit" element={<Mk title="Activity / Audit Logs" text="Immutable compliance logs for changes and authentication events." />} />
        <Route path="announcements" element={<Mk title="Announcements" text="Internal broadcast notices with role-targeting." />} />
      </Route>
      <Route path="*" element={<Navigate to="/portal" />} />
    </Routes>
  );
}
