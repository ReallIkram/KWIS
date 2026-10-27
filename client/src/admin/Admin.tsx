import { useState } from 'react';
import { Link, NavLink, useLocation, Navigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  LayoutDashboard,
  FileText,
  Image,
  Users as UsersIcon,
  Inbox as InboxIcon,
  Settings,
  LogOut,
  Menu,
  X,
  ArrowUpRight,
  Plus,
  Globe,
  Activity,
  Sun,
  Moon,
} from 'lucide-react';
import { request, send } from '../api';
import { modules, fields } from './fields';
import Auth from './Auth';
import Layout from '../components/Layout';
import ContentManager from './ContentManager';
import MediaManager from './MediaManager';
import Inbox from './Inbox';
import { Users, Profile } from './Accounts';
import { PreviewContext } from '../content';
import { Home } from '../pages/Public';
import type { Entry, User } from '../types';
function Dashboard({ user }: { user: User }) {
  const { data, error } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => request('/admin/dashboard'),
  });
  const stats = [
    ['team', 'Team members'],
    ['services', 'Published services'],
    ['projects', 'Portfolio projects'],
    ['blog', 'Published posts'],
    ['careers', 'Job listings'],
  ];
  const counts = data?.data;
  return (
    <>
      <div className="admin-heading">
        <div>
          <p className="eyebrow">YOUR WORKSPACE, AT A GLANCE</p>
          <h1>
            Good to see you, {user.name.split(' ')[0]}
            <span className="accent">.</span>
          </h1>
          <p>Big ideas start with a little attention. Here’s where things stand.</p>
        </div>
        <Link className="button secondary" to="/" target="_blank">
          View website
          <ArrowUpRight size={16} />
        </Link>
      </div>
      {error && <p className="error">{error.message}</p>}
      <div className="dashboard-banner">
        <div>
          <span className="badge">MAKE IT YOURS</span>
          <h2>
            A little change.
            <br />A whole new possibility.
          </h2>
          <p>
            Refresh your homepage, introduce your team,
            <br />
            or share what you’ve been working on.
          </p>
          <Link to="/admin/homepage" className="button">
            Shape your homepage
            <ArrowUpRight size={16} />
          </Link>
        </div>
        <div aria-hidden="true" className="dashboard-sculpture">
          <ArrowUpRight size={120} />
        </div>
      </div>
      <div className="dashboard-stats">
        {stats.map(([kind, label]) => (
          <Link key={kind} to={'/admin/' + kind}>
            <span>{label}</span>
            <strong>
              {counts?.content.find((c: any) => c._id === kind)?.[
                kind === 'team' ? 'total' : 'published'
              ] ?? '—'}
            </strong>
            <ArrowUpRight size={16} />
          </Link>
        ))}
        {['messages', 'applications', 'subscribers'].map((kind) => (
          <Link key={kind} to={'/admin/' + kind}>
            <span>
              {kind === 'messages'
                ? 'Contact inquiries'
                : kind === 'applications'
                  ? 'Applications'
                  : 'Subscribers'}
            </span>
            <strong>{counts?.inbox.find((c: any) => c._id === kind)?.total ?? 0}</strong>
            {kind === 'messages' && (
              <small>{counts?.inbox.find((c: any) => c._id === kind)?.unread ?? 0} unread</small>
            )}
            <ArrowUpRight size={16} />
          </Link>
        ))}
      </div>
      <div className="dashboard-lower">
        <section className="admin-card">
          <div className="card-heading">
            <h2>Recent activity</h2>
            {user.role === 'admin' && <Link to="/admin/activity">View all ↗</Link>}
          </div>
          <ActivityList rows={counts?.activity || []} />
        </section>
        <section className="admin-card">
          <h2>A few useful shortcuts.</h2>
          <div className="quick-links">
            {[
              ['team', 'Introduce a team member'],
              ['services', 'Refine your services'],
              ['blog', 'Share an insight'],
              ['messages', 'Catch up on inquiries'],
            ].map(([url, label]) => (
              <Link to={'/admin/' + url} key={url}>
                <Plus size={17} />
                {label}
                <ArrowUpRight size={16} />
              </Link>
            ))}
          </div>
          <p className="notice">
            Drafts are just for you. Publish a change when you’re ready for the world to see it.
          </p>
        </section>
      </div>
    </>
  );
}
function ActivityList({ rows }: { rows: any[] }) {
  return rows.length ? (
    <ul className="activity-list">
      {rows.map((a) => (
        <li key={a._id}>
          <span className="activity-dot" />
          <div>
            <strong>{a.action}</strong>
            <small>{a.actor}</small>
          </div>
          <time>{new Date(a.createdAt).toLocaleString()}</time>
        </li>
      ))}
    </ul>
  ) : (
    <p className="empty">
      Your workspace story starts here. Activity will appear as you make changes.
    </p>
  );
}
function Logs() {
  const { data, error } = useQuery({
    queryKey: ['activity'],
    queryFn: () => request('/admin/activity'),
  });
  return (
    <>
      <div className="admin-heading">
        <h1>Activity log</h1>
      </div>
      {error && <p className="error">{error.message}</p>}
      <div className="admin-card">
        <ActivityList rows={data?.data || []} />
      </div>
    </>
  );
}
function ContentIndex() {
  return (
    <>
      <div className="admin-heading">
        <div>
          <p className="eyebrow">YOUR WEBSITE / ONE WORKSPACE</p>
          <h1>A place for every detail.</h1>
          <p>Choose a collection to edit drafts and publish your changes.</p>
        </div>
      </div>
      <div className="module-grid">
        {Object.keys(fields).map((kind) => (
          <Link
            className="admin-card"
            key={kind}
            to={'/admin/' + (kind === 'sections' ? 'homepage' : kind)}
          >
            <FileText size={20} />
            <h3>{modules.find((m) => m[0] === kind)?.[1] || 'Page sections'}</h3>
            <span>
              Edit content
              <ArrowUpRight size={15} />
            </span>
          </Link>
        ))}
      </div>
    </>
  );
}
function Preview() {
  const { data, error, isLoading } = useQuery({
    queryKey: ['preview'],
    queryFn: async () => {
      const all = await Promise.all(
        Object.keys(fields).map(async (kind) => {
          let page = 1;
          const entries: Entry[] = [];
          for (;;) {
            const r = await request<{ data: Entry[]; total: number }>(
              `/admin/content/${kind}?limit=100&page=${page}`,
            );
            entries.push(...r.data.map((row) => ({ ...row, id: row._id })));
            if (entries.length >= r.total) break;
            page++;
          }
          return entries;
        }),
      );
      return all.flat().sort((a, b) => a.order - b.order);
    },
  });
  if (error) return <p role="alert">{error.message}</p>;
  if (isLoading) return <p>Preparing preview…</p>;
  return (
    <PreviewContext.Provider value={data || []}>
      <div className="preview-banner">
        SAVED DRAFT PREVIEW · This is not the published website.{' '}
        <Link to="/admin/homepage">Back to editor</Link>
      </div>
      <Layout>
        <Home />
      </Layout>
    </PreviewContext.Provider>
  );
}
export default function Admin() {
  const cache = useQueryClient();
  const location = useLocation();
  const section = location.pathname.split('/')[2] || 'dashboard';
  const [localUser, setLocalUser] = useState<User | null>(null);
  const [open, setOpen] = useState(false);
  const [light, setLight] = useState(false);
  const authPage = ['login', 'forgot', 'reset'].includes(section);
  const auth = useQuery({
    queryKey: ['me'],
    queryFn: () =>
      request<{ data: User }>('/auth/me').catch(async () => {
        await request('/auth/refresh', send('POST'));
        return request<{ data: User }>('/auth/me');
      }),
    retry: false,
    enabled: !authPage && !localUser,
  });
  const user = localUser || auth.data?.data;
  async function signOut() {
    await request('/auth/logout', send('POST'));
    setLocalUser(null);
    cache.clear();
    window.location.hash = '/admin/login';
  }
  if (authPage)
    return (
      <Auth
        onLogin={(u) => {
          setLocalUser(u);
          cache.setQueryData(['me'], { data: u });
        }}
      />
    );
  if (!user && auth.isLoading) return <div className="screen-state">Opening your workspace…</div>;
  if (!user) return <Navigate to="/admin/login" replace />;
  if (section === 'preview') return <Preview />;
  const restricted = ['users', 'activity'];
  const allowed = modules.filter(([key]) => user.role === 'admin' || !restricted.includes(key));
  const icon = (key: string) =>
    key === 'dashboard'
      ? LayoutDashboard
      : ['media', 'hero'].includes(key)
        ? Image
        : ['team', 'users'].includes(key)
          ? UsersIcon
          : ['messages', 'applications', 'subscribers'].includes(key)
            ? InboxIcon
            : ['settings', 'theme', 'locations', 'profile'].includes(key)
              ? Settings
              : key === 'activity'
                ? Activity
                : FileText;
  return (
    <div className={'admin-shell ' + (light ? 'admin-light' : '')}>
      <aside className={'admin-sidebar ' + (open ? 'open' : '')}>
        <div className="sidebar-brand">
          <Link to="/admin/dashboard" className="brand">
            <span className="brand-symbol">
              k<ArrowUpRight size={18} />
            </span>
            <strong>KWIS</strong>
          </Link>
          <span className="workspace-label">WORKSPACE</span>
          <button
            className="mobile-menu icon-button"
            aria-label="Close sidebar"
            onClick={() => setOpen(false)}
          >
            <X />
          </button>
        </div>
        <nav aria-label="Admin navigation">
          {allowed.map(([key, label]) => {
            const Icon = icon(key);
            return (
              <NavLink key={key} to={'/admin/' + key} onClick={() => setOpen(false)}>
                <Icon size={16} />
                {label}
                {key === 'dashboard' && <span className="nav-indicator" />}
              </NavLink>
            );
          })}
        </nav>
        <button className="sidebar-logout" onClick={() => void signOut()}>
          <LogOut size={16} />
          Sign out
        </button>
      </aside>
      <div className="admin-main">
        <header className="admin-topbar">
          <div>
            <button
              className="mobile-menu icon-button"
              aria-label="Open sidebar"
              onClick={() => setOpen(!open)}
            >
              <Menu />
            </button>
            <span>
              KWIS <span className="muted">/</span>{' '}
              {modules.find((m) => m[0] === section)?.[1] || 'Workspace'}
            </span>
          </div>
          <div>
            <span className="live-status">
              <i />
              Workspace online
            </span>
            <button
              className="icon-button"
              aria-label="Toggle dashboard theme"
              onClick={() => setLight(!light)}
            >
              {light ? <Moon size={17} /> : <Sun size={17} />}
            </button>
            <Link to="/" title="View public website">
              <Globe size={18} />
            </Link>
            <Link to="/admin/profile" className="avatar small-avatar">
              {user.name[0].toUpperCase()}
            </Link>
          </div>
        </header>
        <div className="admin-body">
          {restricted.includes(section) && user.role !== 'admin' ? (
            <p>Administrator access is required.</p>
          ) : section === 'dashboard' ? (
            <Dashboard user={user} />
          ) : section === 'content' ? (
            <ContentIndex />
          ) : section === 'media' ? (
            <MediaManager />
          ) : ['applications', 'messages', 'subscribers'].includes(section) ? (
            <Inbox key={section} kind={section} />
          ) : section === 'users' ? (
            <Users />
          ) : section === 'profile' ? (
            <Profile user={user} onSignOut={() => void signOut()} />
          ) : section === 'activity' ? (
            <Logs />
          ) : fields[section === 'homepage' ? 'sections' : section] ? (
            <ContentManager key={section} kind={section === 'homepage' ? 'sections' : section} />
          ) : (
            <Navigate to="/admin/dashboard" replace />
          )}
          <div className="admin-bottom">
            KWIS WORKSPACE<span>Thoughtful control. Endless possibilities.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
