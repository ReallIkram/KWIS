import React, { lazy, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Layout from './components/Layout';
import SEO from './components/SEO';
import { Home, PublicPage, Detail, NotFound } from './pages/Public';
import './styles.css';
import { ContentProvider } from './content';
const Admin = lazy(() => import('./admin/Admin'));
const queryClient = new QueryClient({ defaultOptions: { queries: { retry: 1 } } });
createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <ContentProvider>
        <HashRouter>
          <SEO />
          <Suspense fallback={<div className="screen-state">Loading…</div>}>
            <Routes>
              <Route path="/admin/*" element={<Admin />} />
              <Route element={<Layout />}>
                <Route index element={<Home />} />
                {[
                  'about',
                  'services',
                  'portfolio',
                  'team',
                  'technologies',
                  'industries',
                  'blog',
                  'careers',
                  'contact',
                  'privacy-policy',
                  'terms-and-conditions',
                ].map((p) => (
                  <Route key={p} path={p} element={<PublicPage />} />
                ))}
                {['services', 'portfolio', 'team', 'blog', 'careers'].map((p) => (
                  <Route key={p} path={p + '/:slug'} element={<Detail />} />
                ))}
                <Route path=":page" element={<PublicPage />} />
                <Route path="*" element={<NotFound />} />
              </Route>
            </Routes>
          </Suspense>
        </HashRouter>
      </ContentProvider>
    </QueryClientProvider>
  </React.StrictMode>,
);
