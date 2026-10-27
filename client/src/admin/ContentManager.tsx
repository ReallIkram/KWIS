import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Plus,
  Search,
  ArrowUp,
  ArrowDown,
  GripVertical,
  Copy,
  Trash2,
  Eye,
  Globe,
  Save,
  X,
  ChevronRight,
} from 'lucide-react';
import { request, send } from '../api';
import { fields, modules } from './fields';
import { FormField } from './FormFields';
import type { Entry } from '../types';
const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
export default function ContentManager({ kind }: { kind: string }) {
  const cache = useQueryClient();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<Entry | null>(null);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [drag, setDrag] = useState<number | null>(null);
  const query = useQuery({
    queryKey: ['admin-content', kind, page, search],
    queryFn: () =>
      request<{ data: Entry[]; total: number }>(
        `/admin/content/${kind}?limit=30&page=${page}&search=${encodeURIComponent(search)}`,
      ),
  });
  const rows = query.data?.data || [];
  const refresh = () => {
    void cache.invalidateQueries({ queryKey: ['admin-content', kind] });
    void cache.invalidateQueries({ queryKey: ['public-content'] });
    void cache.invalidateQueries({ queryKey: ['dashboard'] });
  };
  async function action(fn: () => Promise<any>, success: string) {
    setBusy(true);
    setMessage('');
    try {
      await fn();
      refresh();
      setMessage(success);
    } catch (e) {
      setMessage((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function move(from: number, to: number) {
    if (to < 0 || to >= rows.length || to === from) return;
    await action(async () => {
      const ordered = [...rows];
      const [item] = ordered.splice(from, 1);
      ordered.splice(to, 0, item);
      for (let i = 0; i < ordered.length; i++) {
        const r = ordered[i];
        await request(
          `/admin/content/${kind}/${r._id}`,
          send('PUT', { title: r.title, slug: r.slug, order: (page - 1) * 30 + i, data: r.data }),
        );
      }
    }, 'Draft order saved. Publish changed entries to update the website.');
  }
  const heading = modules.find((m) => m[0] === kind)?.[1] || 'Content';
  return (
    <>
      <div className="admin-heading">
        <div>
          <p className="eyebrow">WORKSPACE / CONTENT</p>
          <h1>{heading}</h1>
          <p>Make it yours. Save a draft, preview, then publish when you’re ready.</p>
        </div>
        <button
          className="button"
          onClick={() =>
            setEditing({
              kind,
              slug: '',
              title: '',
              order: query.data?.total || 0,
              data: {
                ...(kind === 'sections' ? { type: 'text', page: 'home', enabled: true } : {}),
                ...(kind === 'hero'
                  ? { enabled: true, muted: true, autoplay: true, loop: true, overlay: 0.6 }
                  : {}),
                ...(kind === 'navigation' ? { enabled: true } : {}),
              },
            })
          }
        >
          <Plus size={16} />
          Add {kind === 'team' ? 'team member' : 'new'}
        </button>
      </div>
      <div className="admin-toolbar">
        <label className="search">
          <Search size={16} />
          <input
            aria-label="Search content"
            placeholder="Search content…"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </label>
        <span>{query.data?.total || 0} items · Drag or use arrows to reorder</span>
      </div>
      <p role="status" className="status-message">
        {message}
      </p>
      {query.error && (
        <p role="alert" className="error">
          {query.error.message}
        </p>
      )}
      {query.isLoading ? (
        <p>Loading content…</p>
      ) : (
        <div className="content-table">
          {rows.length === 0 ? (
            <div className="empty">
              <Plus />
              <h3>A blank canvas, ready for your ideas.</h3>
              <p>Add your first item to get started.</p>
            </div>
          ) : (
            rows.map((r, i) => (
              <div
                key={r._id}
                className="content-row"
                draggable
                onDragStart={() => setDrag(i)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => {
                  if (drag !== null) void move(drag, i);
                  setDrag(null);
                }}
              >
                <GripVertical className="drag-handle" size={17} />
                <div className="reorder">
                  <button
                    disabled={busy || i === 0}
                    title="Move up"
                    onClick={() => void move(i, i - 1)}
                  >
                    <ArrowUp size={13} />
                  </button>
                  <button
                    disabled={busy || i === rows.length - 1}
                    title="Move down"
                    onClick={() => void move(i, i + 1)}
                  >
                    <ArrowDown size={13} />
                  </button>
                </div>
                <button className="row-title" onClick={() => setEditing(structuredClone(r))}>
                  {r.data.image && <img src={r.data.image} alt="" />}
                  <span>
                    <strong>{r.title}</strong>
                    <small>/{r.slug}</small>
                  </span>
                </button>
                <span className={'badge ' + (r.published ? 'published' : 'draft')}>
                  {r.published ? 'Published' : 'Draft'}
                </span>
                <div className="row-actions">
                  <button
                    title="Duplicate"
                    disabled={busy}
                    onClick={() =>
                      void action(
                        () => request(`/admin/content/${kind}/${r._id}/duplicate`, send('POST')),
                        'Draft duplicated',
                      )
                    }
                  >
                    <Copy size={15} />
                  </button>
                  <button title="Edit" onClick={() => setEditing(structuredClone(r))}>
                    <ChevronRight size={17} />
                  </button>
                  <button
                    className="danger"
                    title="Delete"
                    disabled={busy}
                    onClick={() => {
                      if (
                        confirm(
                          `Delete “${r.title}”? This also removes it from the public website.`,
                        )
                      )
                        void action(
                          () => request(`/admin/content/${kind}/${r._id}`, send('DELETE')),
                          'Content deleted',
                        );
                    }}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
      {(query.data?.total || 0) > 30 && (
        <div className="pagination">
          <button disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
            Previous
          </button>
          <span>Page {page}</span>
          <button
            disabled={page * 30 >= (query.data?.total || 0)}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </button>
        </div>
      )}
      {editing && (
        <div className="modal-backdrop">
          <section
            className="editor-panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-title"
          >
            <div className="editor-header">
              <div>
                <span className="eyebrow">{editing._id ? 'EDIT CONTENT' : 'NEW CONTENT'}</span>
                <h2 id="edit-title">{editing.title || heading}</h2>
              </div>
              <button
                aria-label="Close editor"
                onClick={() => {
                  if (confirm('Close editor? Unsaved changes will be lost.')) setEditing(null);
                }}
              >
                <X />
              </button>
            </div>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                await action(async () => {
                  const path = `/admin/content/${kind}${editing._id ? '/' + editing._id : ''}`;
                  const r = await request(
                    path,
                    send(editing._id ? 'PUT' : 'POST', {
                      title: editing.title,
                      slug: editing.slug,
                      order: editing.order,
                      data: editing.data,
                    }),
                  );
                  setEditing(r.data);
                }, 'Draft saved. Publish to make it visible.');
              }}
            >
              <div className="editor-fields">
                <label>
                  Title / heading *
                  <input
                    required
                    maxLength={200}
                    value={editing.title}
                    onChange={(e) =>
                      setEditing({
                        ...editing,
                        title: e.target.value,
                        ...(!editing._id &&
                        (!editing.slug || editing.slug === slugify(editing.title))
                          ? { slug: slugify(e.target.value) }
                          : {}),
                      })
                    }
                  />
                </label>
                <div className="form-grid">
                  <label>
                    URL slug *
                    <input
                      required
                      maxLength={160}
                      pattern="[a-z0-9]+(-[a-z0-9]+)*"
                      value={editing.slug}
                      onChange={(e) => setEditing({ ...editing, slug: e.target.value })}
                    />
                  </label>
                  <label>
                    Display order
                    <input
                      type="number"
                      min={0}
                      max={10000}
                      required
                      value={editing.order}
                      onChange={(e) => setEditing({ ...editing, order: Number(e.target.value) })}
                    />
                  </label>
                </div>
                {fields[kind]?.map((f) => (
                  <FormField
                    key={f.key}
                    field={f}
                    value={editing.data[f.key]}
                    onChange={(v) =>
                      setEditing({ ...editing, data: { ...editing.data, [f.key]: v } })
                    }
                  />
                ))}
              </div>
              <div className="editor-footer">
                <div>
                  <button type="submit" className="button secondary" disabled={busy}>
                    <Save size={16} />
                    Save draft
                  </button>
                  {editing._id && (
                    <button
                      type="button"
                      className="button"
                      disabled={busy}
                      onClick={() =>
                        void action(async () => {
                          await request(
                            `/admin/content/${kind}/${editing._id}`,
                            send('PUT', {
                              title: editing.title,
                              slug: editing.slug,
                              order: editing.order,
                              data: editing.data,
                            }),
                          );
                          const r = await request(
                            `/admin/content/${kind}/${editing._id}/publish`,
                            send('POST'),
                          );
                          setEditing(r.data);
                        }, 'Published. The website will refresh within 15 seconds.')
                      }
                    >
                      <Globe size={16} />
                      Publish
                    </button>
                  )}
                </div>
                <div>
                  {!!editing.published && (
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() =>
                        void action(async () => {
                          const r = await request(
                            `/admin/content/${kind}/${editing._id}/unpublish`,
                            send('POST'),
                          );
                          setEditing(r.data);
                        }, 'Unpublished')
                      }
                    >
                      Unpublish
                    </button>
                  )}
                  <a className="subtle" href="#/admin/preview" target="_blank" rel="noreferrer">
                    <Eye size={15} />
                    Preview saved drafts
                  </a>
                </div>
                <p role="status">{busy ? 'Saving…' : message}</p>
              </div>
            </form>
          </section>
        </div>
      )}
    </>
  );
}
