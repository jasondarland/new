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
    <section className="section" id="products">
      <div className="container">
        <div className="section-title">
          <div>
            <h2>Core Product Platforms</h2>
          </div>
          <p>
            Show Systems International is built around two primary control platforms:
            IMMERSE™ for distributed experience systems and TITAN™ for industrial
            ride and attraction control.
          </p>
        </div>

        <div className="two-platform-grid">
          <article className="card platform-card platform-immerse">
            <div className="platform-top">
              <span className="platform-badge badge-immerse">Distributed Show Control</span>
              <h3>IMMERSE™</h3>
              <p>
                IMMERSE™ is SSI’s distributed show control platform for immersive
                attractions, museums, haunted houses, exhibits, interactive environments,
                and multi-room experiences.
              </p>
            </div>

            <div className="platform-columns">
              <div>
                <h4>Best For</h4>
                <ul className="platform-list">
                  <li>Haunted attractions</li>
                  <li>Museums and exhibits</li>
                  <li>Interactive walkthroughs</li>
                  <li>Smaller to mid-size attractions</li>
                </ul>
              </div>

              <div>
                <h4>Capabilities</h4>
                <ul className="platform-list">
                  <li>Distributed node architecture</li>
                  <li>Audio, video, lighting, and GPIO control</li>
                  <li>Trigger-based and timed events</li>
                  <li>Flexible programming and runtime workflows</li>
                </ul>
              </div>
            </div>
          </article>

          <article className="card platform-card platform-titan">
            <div className="platform-top">
              <span className="platform-badge badge-titan">Industrial Ride Show Control</span>
              <h3>TITAN™</h3>
              <p>
                TITAN™ is SSI’s industrial rack-based control platform for ride systems,
                dark rides, major attraction environments, synchronized scenes, and
                mission-critical show execution.
              </p>
            </div>

            <div className="platform-columns">
              <div>
                <h4>Best For</h4>
                <ul className="platform-list">
                  <li>Dark rides</li>
                  <li>Roller coasters</li>
                  <li>Large-scale attractions</li>
                  <li>Centralized industrial control systems</li>
                </ul>
              </div>

              <div>
                <h4>Capabilities</h4>
                <ul className="platform-list">
                  <li>Rack-based control architecture</li>
                  <li>Ride and PLC interface support</li>
                  <li>Redundant media and I/O infrastructure</li>
                  <li>High-reliability attraction operation</li>
                </ul>
              </div>
            </div>
          </article>
        </div>
      </div>
    </section>
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
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/products/immerse" element={<ImmersePage />} />
        <Route path="/products/titan" element={<TitanPage />} />
        <Route path="/solutions" element={<SolutionsPage />} />
        <Route path="/support" element={<SupportPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/portal-login" element={<PortalLoginPage />} />
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
