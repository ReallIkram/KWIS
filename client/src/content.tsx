import { createContext, useContext, type ReactNode } from 'react';
import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { request, STATIC_MODE } from './api';
import type { Entry } from './types';
export const PreviewContext = createContext<Entry[] | null>(null);
const ContentContext = createContext<UseQueryResult<{ data: Entry[] }, Error> | null>(null);
export function ContentProvider({ children }: { children: ReactNode }) {
  const query = useQuery({
    queryKey: ['public-content'],
    queryFn: () => request<{ data: Entry[] }>('/public/content'),
    refetchInterval: STATIC_MODE ? false : 15000,
    refetchOnWindowFocus: true,
    staleTime: STATIC_MODE ? Infinity : 0,
  });
  return <ContentContext.Provider value={query}>{children}</ContentContext.Provider>;
}
export function useContent() {
  const preview = useContext(PreviewContext);
  const query = useContext(ContentContext);
  if (!query) throw new Error('ContentProvider is required');
  const rows = preview || query.data?.data || [];
  return {
    ...query,
    isLoading: preview ? false : query.isLoading,
    error: preview ? null : query.error,
    rows,
    list: (kind: string) => rows.filter((r) => r.kind === kind),
    one: (kind: string, slug?: string) =>
      rows.find((r) => r.kind === kind && (!slug || r.slug === slug)),
  };
}
