import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { request, send } from '../api';
import type { User } from '../types';
export function Users() {
  const cache = useQueryClient();
  const { data, error } = useQuery({ queryKey: ['users'], queryFn: () => request('/admin/users') });
  const [editing, setEditing] = useState<any>(null);
  const [message, setMessage] = useState('');
  return (
    <>
      <div className="admin-heading">
        <div>
          <p className="eyebrow">ACCESS / PEOPLE</p>
          <h1>User management</h1>
          <p>Administrators manage access. Editors manage content and inquiries.</p>
        </div>
        <button
          className="button"
          onClick={() => setEditing({ name: '', email: '', password: '', role: 'editor' })}
        >
          Add user
        </button>
      </div>
      {error && <p className="error">{error.message}</p>}
      <p role="status">{message}</p>
      <div className="content-table">
        {data?.data.map((u: any) => (
          <button className="inbox-row" key={u._id} onClick={() => setEditing(u)}>
            <span className="avatar">{u.name[0]}</span>
            <span>
              <strong>{u.name}</strong>
              <small>{u.email}</small>
            </span>
            <span className="badge">{u.role}</span>
            <span>{u.active ? 'Active' : 'Disabled'}</span>
          </button>
        ))}
      </div>
      {editing && (
        <form
          className="admin-card account-form"
          onSubmit={async (e) => {
            e.preventDefault();
            try {
              await request(
                '/admin/users' + (editing._id ? '/' + editing._id : ''),
                send(
                  editing._id ? 'PATCH' : 'POST',
                  editing._id
                    ? { name: editing.name, role: editing.role, active: editing.active }
                    : {
                        name: editing.name,
                        email: editing.email,
                        password: editing.password,
                        role: editing.role,
                      },
                ),
              );
              setMessage('User saved');
              setEditing(null);
              await cache.invalidateQueries({ queryKey: ['users'] });
            } catch (e) {
              setMessage((e as Error).message);
            }
          }}
        >
          <h2>{editing._id ? 'Edit access' : 'Invite a new colleague'}</h2>
          <label>
            Name
            <input
              required
              value={editing.name}
              onChange={(e) => setEditing({ ...editing, name: e.target.value })}
            />
          </label>
          {!editing._id && (
            <>
              <label>
                Email
                <input
                  type="email"
                  required
                  value={editing.email}
                  onChange={(e) => setEditing({ ...editing, email: e.target.value })}
                />
              </label>
              <label>
                Initial password (12+ characters)
                <input
                  type="password"
                  minLength={12}
                  maxLength={128}
                  required
                  autoComplete="new-password"
                  value={editing.password}
                  onChange={(e) => setEditing({ ...editing, password: e.target.value })}
                />
              </label>
            </>
          )}
          <label>
            Role
            <select
              value={editing.role}
              onChange={(e) => setEditing({ ...editing, role: e.target.value })}
            >
              <option value="editor">Editor</option>
              <option value="admin">Administrator</option>
            </select>
          </label>
          {editing._id && (
            <label className="checkbox-field">
              <input
                type="checkbox"
                checked={editing.active}
                onChange={(e) => setEditing({ ...editing, active: e.target.checked })}
              />
              Account active
            </label>
          )}
          {editing._id && (
            <button
              type="button"
              className="danger subtle"
              onClick={async () => {
                if (!confirm('Delete this user permanently? Their active sessions will end.'))
                  return;
                try {
                  await request('/admin/users/' + editing._id, send('DELETE'));
                  setEditing(null);
                  setMessage('User deleted');
                  await cache.invalidateQueries({ queryKey: ['users'] });
                } catch (e) {
                  setMessage((e as Error).message);
                }
              }}
            >
              Delete user
            </button>
          )}
          <div className="row-actions">
            <button className="button">Save user</button>
            <button type="button" onClick={() => setEditing(null)}>
              Cancel
            </button>
          </div>
        </form>
      )}
    </>
  );
}
export function Profile({ user, onSignOut }: { user: User; onSignOut: () => void }) {
  const [message, setMessage] = useState('');
  return (
    <>
      <div className="admin-heading">
        <div>
          <p className="eyebrow">ACCOUNT / PROFILE</p>
          <h1>My profile</h1>
          <p>
            {user.email} · {user.role}
          </p>
        </div>
      </div>
      <form
        className="admin-card account-form"
        onSubmit={async (e) => {
          e.preventDefault();
          const values = new FormData(e.currentTarget);
          const data = {
            name: values.get('name'),
            ...(values.get('password')
              ? { password: values.get('password'), currentPassword: values.get('currentPassword') }
              : {}),
          };
          try {
            await request('/admin/profile', send('PATCH', data));
            setMessage('Profile updated');
            if (data.password) onSignOut();
          } catch (e) {
            setMessage((e as Error).message);
          }
        }}
      >
        <label>
          Name
          <input name="name" defaultValue={user.name} required />
        </label>
        <label>
          Current password
          <input type="password" name="currentPassword" autoComplete="current-password" />
        </label>
        <label>
          New password (leave blank to keep current)
          <input
            type="password"
            minLength={12}
            maxLength={128}
            name="password"
            autoComplete="new-password"
          />
        </label>
        <button className="button">Save profile</button>
        <p role="status">{message}</p>
      </form>
    </>
  );
}
