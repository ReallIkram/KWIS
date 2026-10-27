export type LinkItem = { label: string; url: string };
export type Data = Record<string, any>;
export type Entry = {
  id?: string;
  _id?: string;
  kind: string;
  slug: string;
  title: string;
  order: number;
  data: Data;
  published?: Record<string, any> | null;
  updatedAt?: string;
};
export type User = { id: string; name: string; email: string; role: 'admin' | 'editor' };
