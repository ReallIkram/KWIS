import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LockKeyhole, ArrowUpRight, ArrowLeft } from 'lucide-react';
import { request, send } from '../api';
import type { User } from '../types';
export default function Auth({ onLogin }: { onLogin: (u: User) => void }) {
  const path = useLocation();
  const navigate = useNavigate();
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const forgot = path.pathname.endsWith('/forgot');
  const reset = path.pathname.endsWith('/reset');
  return (
    <div className="auth-page">
      <div className="auth-art">
        <Link to="/" className="brand">
          <span className="brand-symbol">
            k<ArrowUpRight size={18} />
          </span>
          <strong>KWIS</strong>
        </Link>
        <div>
          <p className="eyebrow">THE CREATIVE SIDE OF CONTROL.</p>
          <h1>
            Your ideas.
            <br />
            Your website.
            <br />
            <span className="gradient-text">Your next chapter.</span>
          </h1>
          <p>A thoughtful workspace for everything KWIS.</p>
        </div>
        <small>KNOWLEGE WEB INNOVATIVE SOLUTIONS</small>
      </div>
      <div className="auth-form">
        <Link to="/" className="back-link">
          <ArrowLeft size={15} />
          Back to website
        </Link>
        <div className="auth-box">
          <span className="auth-lock">
            <LockKeyhole size={22} />
          </span>
          <p className="eyebrow">KWIS WORKSPACE</p>
          <h2>{forgot ? 'Let’s get you back in.' : reset ? 'A fresh start.' : 'Welcome back.'}</h2>
          <p>
            {forgot
              ? 'Enter your email to request a reset link.'
              : reset
                ? 'Choose a strong new password.'
                : 'Sign in to bring your next ideas to life.'}
          </p>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              const form = new FormData(e.currentTarget);
              setBusy(true);
              setMessage('');
              try {
                if (forgot) {
                  const r = await request(
                    '/auth/forgot',
                    send('POST', { email: form.get('email') }),
                  );
                  setMessage(r.data);
                } else if (reset) {
                  await request(
                    '/auth/reset',
                    send('POST', {
                      token: new URLSearchParams(path.search).get('token'),
                      password: form.get('password'),
                    }),
                  );
                  setMessage('Password updated. You can sign in now.');
                } else {
                  const r = await request(
                    '/auth/login',
                    send('POST', { email: form.get('email'), password: form.get('password') }),
                  );
                  onLogin(r.data);
                  navigate('/admin/dashboard', { replace: true });
                }
              } catch (e) {
                setMessage((e as Error).message);
              } finally {
                setBusy(false);
              }
            }}
          >
            {!reset && (
              <label>
                Email address
                <input name="email" type="email" autoComplete="username" required />
              </label>
            )}
            {!forgot && (
              <label>
                Password
                <input
                  name="password"
                  type="password"
                  autoComplete={reset ? 'new-password' : 'current-password'}
                  minLength={reset ? 12 : 1}
                  maxLength={128}
                  required
                />
              </label>
            )}
            <button className="button" disabled={busy}>
              {busy
                ? 'Please wait…'
                : forgot
                  ? 'Send reset link'
                  : reset
                    ? 'Update password'
                    : 'Sign in to workspace'}
              <ArrowUpRight size={17} />
            </button>
            <p role="status" className="status-message">
              {message}
            </p>
          </form>
          <Link className="auth-help" to={forgot || reset ? '/admin/login' : '/admin/forgot'}>
            {forgot || reset ? 'Back to sign in' : 'Forgot your password?'}
          </Link>
          <div className="auth-security">
            <LockKeyhole size={12} />
            Secure access. Thoughtful control.
          </div>
        </div>
      </div>
    </div>
  );
}
