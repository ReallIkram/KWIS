import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Download, Search, Mail, Trash2, X, Save, FileText } from 'lucide-react';
import { API, request, send } from '../api';
export default function Inbox({ kind }: { kind: string }) {
  const cache = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('');
  const [selected, setSelected] = useState<any>(null);
  const [message, setMessage] = useState('');
  const { data, error, isLoading } = useQuery({
    queryKey: ['inbox', kind, page, search, filter],
    queryFn: () =>
      request(
        `/admin/inbox/${kind}?page=${page}&search=${encodeURIComponent(search)}${filter ? '&status=' + filter : ''}`,
      ),
  });
  const statuses =
    kind === 'applications'
      ? ['new', 'reviewing', 'shortlisted', 'rejected', 'hired']
      : ['new', 'read', 'replied', 'qualified', 'archived'];
  const refresh = () => void cache.invalidateQueries({ queryKey: ['inbox', kind] });
  return (
    <>
      <div className="admin-heading">
        <div>
          <p className="eyebrow">RELATIONSHIPS / INBOX</p>
          <h1>
            {kind === 'messages'
              ? 'Contact inbox'
              : kind === 'applications'
                ? 'Job applications'
                : 'Newsletter subscribers'}
          </h1>
          <p>Keep every conversation moving forward.</p>
        </div>
        <a className="button secondary" href={API + '/admin/export/' + kind} download>
          <Download size={16} />
          Export CSV
        </a>
      </div>
      <div className="admin-toolbar">
        <label className="search">
          <Search size={15} />
          <input
            aria-label="Search inbox"
            placeholder="Search by name or email…"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </label>
        <select
          aria-label="Filter status"
          value={filter}
          onChange={(e) => {
            setFilter(e.target.value);
            setPage(1);
          }}
        >
          <option value="">All statuses</option>
          {statuses.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
      </div>
      <p role="status">{message}</p>
      {error && <p className="error">{error.message}</p>}
      {isLoading ? (
        <p>Loading inbox…</p>
      ) : (
        <div className="content-table">
          {data?.data.length === 0 && (
            <div className="empty">
              <Mail />
              <h3>All quiet, for now.</h3>
              <p>New submissions will appear here.</p>
            </div>
          )}
          {data?.data.map((r: any) => (
            <button className="inbox-row" key={r._id} onClick={() => setSelected(r)}>
              <span className="avatar">{(r.name || r.email)[0].toUpperCase()}</span>
              <span>
                <strong>{r.name || r.email}</strong>
                <small>{r.email}</small>
              </span>
              <span className="inbox-excerpt">{r.message || 'Newsletter signup'}</span>
              <span className="badge">{r.status}</span>
              <small>{new Date(r.createdAt).toLocaleDateString()}</small>
            </button>
          ))}
        </div>
      )}
      <div className="pagination">
        <button disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
          Previous
        </button>
        <span>
          Page {page} · {data?.total || 0} records
        </span>
        <button disabled={page * 30 >= (data?.total || 0)} onClick={() => setPage((p) => p + 1)}>
          Next
        </button>
      </div>
      {selected && (
        <div className="modal-backdrop">
          <section
            className="editor-panel inbox-detail"
            role="dialog"
            aria-modal="true"
            aria-label="Submission details"
          >
            <div className="editor-header">
              <div>
                <p className="eyebrow">{kind}</p>
                <h2>{selected.name || selected.email}</h2>
              </div>
              <button aria-label="Close details" onClick={() => setSelected(null)}>
                <X />
              </button>
            </div>
            <div className="editor-fields">
              <dl>
                {[
                  'email',
                  'phone',
                  'company',
                  'service',
                  'budget',
                  'job',
                  'portfolio',
                  'linkedin',
                  'message',
                ]
                  .filter((k) => selected[k])
                  .map((k) => (
                    <div key={k}>
                      <dt>{k}</dt>
                      <dd>{selected[k]}</dd>
                    </div>
                  ))}
              </dl>
              {selected.resume && (
                <button
                  className="button secondary"
                  onClick={async () => {
                    try {
                      const r = await request('/admin/resume/' + selected.resume);
                      window.open(r.data.url, '_blank', 'noopener,noreferrer');
                    } catch (e) {
                      setMessage((e as Error).message);
                    }
                  }}
                >
                  <FileText size={16} />
                  Download private resume
                </button>
              )}
              <label>
                Status
                <select
                  value={selected.status}
                  onChange={(e) => setSelected({ ...selected, status: e.target.value })}
                >
                  {statuses.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </label>
              <label>
                Internal notes
                <textarea
                  rows={6}
                  value={selected.notes || ''}
                  onChange={(e) => setSelected({ ...selected, notes: e.target.value })}
                />
              </label>
              <button
                className="button"
                onClick={async () => {
                  try {
                    await request(
                      '/admin/inbox/' + selected._id,
                      send('PATCH', { status: selected.status, notes: selected.notes || '' }),
                    );
                    refresh();
                    setMessage('Submission updated');
                  } catch (e) {
                    setMessage((e as Error).message);
                  }
                }}
              >
                <Save size={16} />
                Save changes
              </button>
              <button
                className="danger subtle"
                onClick={async () => {
                  if (!confirm('Permanently delete this submission?')) return;
                  try {
                    await request('/admin/inbox/' + selected._id, send('DELETE'));
                    refresh();
                    setSelected(null);
                    setMessage('Submission deleted');
                  } catch (e) {
                    setMessage((e as Error).message);
                  }
                }}
              >
                <Trash2 size={15} />
                Delete submission
              </button>
              <p role="status">{message}</p>
            </div>
          </section>
        </div>
      )}
    </>
  );
}
