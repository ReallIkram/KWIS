import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Upload, Copy, Trash2, Save, Search } from 'lucide-react';
import { API, request, send } from '../api';
export default function MediaManager() {
  const cache = useQueryClient();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState('all');
  const [message, setMessage] = useState('');
  const [progress, setProgress] = useState<number | null>(null);
  const { data, error, isLoading } = useQuery({
    queryKey: ['media', search, page],
    queryFn: () =>
      request(`/admin/media?limit=30&page=${page}&search=${encodeURIComponent(search)}`),
  });
  async function upload(file: File) {
    setProgress(0);
    setMessage('');
    try {
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', API + '/admin/media');
        xhr.withCredentials = true;
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) setProgress(Math.round((e.loaded / e.total) * 100));
        };
        xhr.onload = () => {
          let result: any;
          try {
            result = JSON.parse(xhr.responseText);
          } catch {
            result = { error: 'Upload failed' };
          }
          if (xhr.status >= 200 && xhr.status < 300) resolve();
          else reject(new Error(result.error || 'Upload failed'));
        };
        xhr.onerror = () => reject(new Error('Upload failed. Check API connectivity.'));
        const form = new FormData();
        form.set('file', file);
        xhr.send(form);
      });
      await cache.invalidateQueries({ queryKey: ['media'] });
      setMessage('Upload complete. Choose this file from any content editor.');
    } catch (e) {
      setMessage((e as Error).message);
    } finally {
      setProgress(null);
    }
  }
  return (
    <>
      <div className="admin-heading">
        <div>
          <p className="eyebrow">ASSETS / LIBRARY</p>
          <h1>Media library</h1>
          <p>A home for your images and videos. Stored persistently in Cloudinary.</p>
        </div>
        <label className="button">
          <Upload size={16} />
          Upload media
          <input
            className="sr-only"
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml,video/mp4,video/webm"
            disabled={progress !== null}
            onChange={(e) => {
              if (e.target.files?.[0]) void upload(e.target.files[0]);
              e.target.value = '';
            }}
          />
        </label>
      </div>
      <p className="notice">
        Images and MP4/WebM video, up to 50 MB. SVG files are sanitized to self-contained vector
        shapes. Resume PDFs stay private in Applications.
      </p>
      <div className="admin-toolbar">
        <label className="search">
          <Search size={16} />
          <input
            aria-label="Search media"
            placeholder="Search files…"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </label>
        <select
          aria-label="Filter media"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="all">All media</option>
          <option value="image">Images</option>
          <option value="video">Videos</option>
        </select>
      </div>
      {progress !== null && (
        <div className="upload-progress">
          <progress max={100} value={progress} />
          <span>{progress}% uploaded</span>
        </div>
      )}
      <p role="status">{message}</p>
      {error && <p className="error">{error.message}</p>}
      {isLoading ? (
        <p>Loading assets…</p>
      ) : (
        <div className="media-grid">
          {data?.data
            .filter((m: any) => filter === 'all' || m.mime?.startsWith(filter))
            .map((m: any) => (
              <MediaCard
                key={m._id}
                media={m}
                onSave={async (name, alt) => {
                  try {
                    await request('/admin/media/' + m._id, send('PATCH', { name, alt }));
                    setMessage('Media details saved');
                    await cache.invalidateQueries({ queryKey: ['media'] });
                  } catch (e) {
                    setMessage((e as Error).message);
                  }
                }}
                onDelete={async () => {
                  if (!confirm('Delete this unused asset permanently?')) return;
                  try {
                    await request('/admin/media/' + m._id, send('DELETE'));
                    await cache.invalidateQueries({ queryKey: ['media'] });
                    setMessage('Media deleted');
                  } catch (e) {
                    setMessage((e as Error).message);
                  }
                }}
              />
            ))}
          {data?.data.length === 0 && (
            <div className="empty">
              <Upload />
              <h3>Your library starts here.</h3>
              <p>Upload an image or video, then select it in a content editor.</p>
            </div>
          )}
        </div>
      )}
      <div className="pagination">
        <button disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
          Previous
        </button>
        <span>Page {page}</span>
        <button disabled={!data || data.data.length < 30} onClick={() => setPage((p) => p + 1)}>
          Next
        </button>
      </div>
    </>
  );
}
function MediaCard({
  media: m,
  onSave,
  onDelete,
}: {
  media: any;
  onSave: (name: string, alt: string) => void;
  onDelete: () => void;
}) {
  const [name, setName] = useState(m.name);
  const [alt, setAlt] = useState(m.alt || '');
  const [copied, setCopied] = useState(false);
  return (
    <article className="media-card">
      {m.mime?.startsWith('video') ? (
        <video controls src={m.url} />
      ) : (
        <img src={m.url} alt={alt || name} loading="lazy" />
      )}
      <div>
        <label>
          File name
          <input value={name} onChange={(e) => setName(e.target.value)} />
        </label>
        <label>
          Alternative text
          <input value={alt} onChange={(e) => setAlt(e.target.value)} />
        </label>
        <small>
          {(m.bytes / 1024 / 1024).toFixed(2)} MB · {m.width ? `${m.width} × ${m.height}` : m.mime}
        </small>
        <div className="row-actions">
          <button onClick={() => onSave(name, alt)}>
            <Save size={15} />
            Save
          </button>
          <button
            onClick={async () => {
              await navigator.clipboard.writeText(m.url);
              setCopied(true);
            }}
          >
            <Copy size={15} />
            {copied ? 'Copied' : 'URL'}
          </button>
          <button className="danger" aria-label="Delete asset" onClick={onDelete}>
            <Trash2 size={15} />
          </button>
        </div>
      </div>
    </article>
  );
}
