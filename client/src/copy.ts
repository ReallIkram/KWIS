import { useContent } from './content';
import { defaultCopy } from '../../server/src/default-copy';
export function useCopy() {
  const data = useContent().one('settings')?.data;
  return (key: string) =>
    data?.labels?.find((r: { key: string; text: string }) => r.key === key)?.text ??
    defaultCopy[key] ??
    key;
}
