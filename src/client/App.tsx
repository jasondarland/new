import type { FormEvent, ReactNode } from 'react';
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import { PublicLayout } from './layouts/PublicLayout';
import { PortalLayout } from './layouts/PortalLayout';
import { useQuery } from '@tanstack/react-query';
import { api, fetchSession } from './lib/api';

const Section = ({ title, children }: { title: string; children: ReactNode }) => (
  <article className="panel">
    <h2>{title}</h2>
    {children}
  </article>
);

const FeatureList = ({ items }: { items: string[] }) => (
  <ul className="feature-list">{items.map((i) => <li key={i}>{i}</li>)}</ul>
);

const DataTable = ({ columns, rows }: { columns: string[]; rows: Array<(string | number | null | undefined)[]> }) => (
  <div className="table-wrap">
    <table>
      <thead><tr>{columns.map((c) => <th key={c}>{c}</th>)}</tr></thead>
      <tbody>
        {rows.map((r, idx) => <tr key={idx}>{r.map((c, cidx) => <td key={cidx}>{String(c ?? '-')}</td>)}</tr>)}
      </tbody>
    </table>
  </div>
);

function HomePage() {
  return (
    <>
      <Section title="Engineering Immersive Attractions at Enterprise Scale">
        <p>Show Systems International (SSI) delivers high-reliability show control, ride integration, and lifecycle support for world-class attractions.</p>
        <FeatureList items={[
          'Mission-critical control for attractions and themed environments',
          'Multi-site deployments with standardized commissioning practices',
          '24/7 support programs with SLA-driven response and diagnostics'
        ]} />
      </Section>
      <Section title="Trusted Platform Stack">
        <FeatureList items={['IMMERSE™ media and show orchestration', 'TITAN™ industrial control backbone', 'SSI Portal for project, support, licensing, and documentation governance']} />
      </Section>
    </>
  );
}

function AboutPage() {
  return <Section title="About SSI"><p>SSI partners with operators, EPC firms, integrators, and OEM teams to design, deploy, and support complex attraction technology programs from concept through operations.</p></Section>;
}
function ProductsPage() {
  return <Section title="Products"><p>SSI products are designed for deterministic performance, maintainability, and operational visibility across large-scale attractions.</p><FeatureList items={['IMMERSE™: show sequence and media synchronization', 'TITAN™: robust I/O and safety-aligned control execution']} /></Section>;
}
function ImmersePage() {
  return <Section title="IMMERSE™"><FeatureList items={['Timeline-based show control and cue orchestration', 'Low-latency synchronization for media/effects systems', 'Multi-node resiliency and failover-ready architecture']} /></Section>;
}
function TitanPage() {
  return <Section title="TITAN™"><FeatureList items={['Industrial-grade control runtime', 'Deterministic command routing and telemetry', 'Commissioning toolchain for FAT/SAT workflows']} /></Section>;
}
function SolutionsPage() {
  return <Section title="Solutions"><FeatureList items={['Ride/Show integration', 'Commissioning and acceptance support', 'Operations optimization and long-term lifecycle support']} /></Section>;
}
function SupportPage() {
  return <Section title="Support"><FeatureList items={['Ticketed support with assignment and SLA indicators', 'Remote diagnostics and escalation playbooks', 'Knowledge base, release advisories, and documentation access']} /></Section>;
}
function ContactPage() {
  return <Section title="Contact SSI"><p>For enterprise project inquiries, OEM partnerships, and support programs, contact our technical sales team. Production deployments should enforce Turnstile on this form and all auth/reset workflows.</p></Section>;
}

function PortalLoginPage() {
  const navigate = useNavigate();
  async function login(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    try {
      await api('/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: form.get('email'),
          password: form.get('password'),
          turnstileToken: form.get('turnstileToken')
        })
      });
      navigate('/portal');
      window.location.reload();
    } catch (err) {
      alert(String(err));
    }
  }
  return (
    <Section title="Portal Login">
      <form className="stack" onSubmit={login}>
        <input name="email" placeholder="email" defaultValue="superadmin@ssi.demo" />
        <input name="password" placeholder="password" defaultValue="DemoPass!123" type="password" />
        <input name="turnstileToken" placeholder="Turnstile token" />
        <button type="submit">Sign In</button>
      </form>
      <p className="muted">Turnstile token is required in production; for local testing you can stub verification or provide a test token.</p>
    </Section>
  );
}

function PublicRoutes() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/products/immerse" element={<ImmersePage />} />
        <Route path="/products/titan" element={<TitanPage />} />
        <Route path="/solutions" element={<SolutionsPage />} />
        <Route path="/support" element={<SupportPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/portal-login" element={<PortalLoginPage />} />
      </Route>
    </Routes>
  );
}

function DashboardPage() {
  const { data } = useQuery({ queryKey: ['dashboard'], queryFn: () => api<{ projects: number; openTickets: number; pendingTasks: number }>('/dashboard') });
  return <Section title="Dashboard"><div className="kpis"><div><h3>{data?.projects ?? '-'}</h3><p>Projects</p></div><div><h3>{data?.openTickets ?? '-'}</h3><p>Open Tickets</p></div><div><h3>{data?.pendingTasks ?? '-'}</h3><p>Pending Tasks</p></div></div></Section>;
}

function ProjectsPage() {
  const projects = useQuery({ queryKey: ['projects'], queryFn: () => api<Array<{ id: string; name: string; status: string; start_date: string; end_date: string }>>('/projects') });
  return <Section title="Projects"><DataTable columns={['Name', 'Status', 'Start', 'End']} rows={(projects.data ?? []).map((p) => [p.name, p.status, p.start_date, p.end_date])} /></Section>;
}

function SimpleFeedPage({ title, endpoint, columns }: { title: string; endpoint: string; columns: string[] }) {
  const feed = useQuery({ queryKey: [endpoint], queryFn: () => api<any[]>(endpoint) });
  return <Section title={title}><DataTable columns={columns} rows={(feed.data ?? []).map((row) => columns.map((c) => row[c.toLowerCase().replace(/\s+/g, '_')] ?? row[c] ?? '-'))} /></Section>;
}

function AnnouncementsPage() {
  const items = useQuery({ queryKey: ['announcements'], queryFn: () => api<Array<{ title: string; body: string; starts_at: string }>>('/announcements') });
  return <Section title="Internal Announcements">{(items.data ?? []).map((a) => <div key={a.title} className="notice"><strong>{a.title}</strong><p>{a.body}</p><small>{a.starts_at}</small></div>)}</Section>;
}

export function App() {
  const session = useQuery({ queryKey: ['me'], queryFn: fetchSession, retry: false });
  const user = session.data?.user;

  if (!user) return <PublicRoutes />;

  return (
    <Routes>
      <Route path="/portal" element={<PortalLayout user={user} />}>
        <Route index element={<DashboardPage />} />
        <Route path="projects" element={<ProjectsPage />} />
        <Route path="tasks" element={<SimpleFeedPage title="Tasks / Milestones" endpoint="/tasks" columns={['Title', 'Status', 'Priority', 'Due Date']} />} />
        <Route path="tickets" element={<SimpleFeedPage title="Support Tickets" endpoint="/tickets" columns={['Title', 'Status', 'Priority', 'Sla Due At']} />} />
        <Route path="licenses" element={<SimpleFeedPage title="License Key Management" endpoint="/licenses" columns={['Key Value', 'Product Code', 'Status', 'Maintenance Status']} />} />
        <Route path="downloads" element={<SimpleFeedPage title="Downloads Center" endpoint="/downloads" columns={['Title', 'Category', 'Product Code']} />} />
        <Route path="documents" element={<SimpleFeedPage title="Document Management" endpoint="/documents" columns={['Title', 'Category', 'Visibility']} />} />
        <Route path="commissioning" element={<SimpleFeedPage title="Commissioning / Installation Tracking" endpoint="/commissioning" columns={['Checklist Item', 'Status', 'Completed At']} />} />
        <Route path="clients" element={<SimpleFeedPage title="Client / Company Management" endpoint="/companies" columns={['Name', 'Company Type', 'Billing Email']} />} />
        <Route path="users" element={<SimpleFeedPage title="User / Role / Permission Admin" endpoint="/users" columns={['Full Name', 'Email', 'Role', 'Status']} />} />
        <Route path="audit" element={<SimpleFeedPage title="Activity Logs / Audit Logs" endpoint="/audit" columns={['Action', 'Target Type', 'Created At']} />} />
        <Route path="announcements" element={<AnnouncementsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/portal" />} />
    </Routes>
  );
}
