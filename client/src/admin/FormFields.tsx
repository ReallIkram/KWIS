import { useEffect, useState, useId } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Code,
  Heading2,
  Quote,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Image,
} from 'lucide-react';
import { request } from '../api';
import type { Field } from './fields';
export function RichEditor({
  value,
  onChange,
  label,
}: {
  value: string;
  onChange: (value: string) => void;
  label: string;
}) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: value || '',
    editorProps: {
      attributes: {
        class: 'rich-editor',
        role: 'textbox',
        'aria-label': label,
        'aria-multiline': 'true',
      },
    },
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  });
  useEffect(() => {
    if (editor && value !== editor.getHTML()) editor.commands.setContent(value || '');
  }, [value, editor]);
  if (!editor) return null;
  const actions = [
    ['Bold', Bold, () => editor.chain().focus().toggleBold().run()],
    ['Italic', Italic, () => editor.chain().focus().toggleItalic().run()],
    ['Heading', Heading2, () => editor.chain().focus().toggleHeading({ level: 2 }).run()],
    ['Bullet list', List, () => editor.chain().focus().toggleBulletList().run()],
    ['Numbered list', ListOrdered, () => editor.chain().focus().toggleOrderedList().run()],
    ['Code block', Code, () => editor.chain().focus().toggleCodeBlock().run()],
    ['Quote', Quote, () => editor.chain().focus().toggleBlockquote().run()],
  ] as const;
  return (
    <div className="editor">
      <div className="editor-toolbar">
        {actions.map(([title, Icon, action]) => (
          <button type="button" key={title} aria-label={title} title={title} onClick={action}>
            <Icon size={16} />
          </button>
        ))}
        <button
          type="button"
          onClick={() => {
            const href = window.prompt('Link URL (https://…)');
            if (href && /^https?:\/\//.test(href)) editor.chain().focus().setLink({ href }).run();
          }}
        >
          Link
        </button>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
export function FormField({
  field,
  value,
  onChange,
}: {
  field: Field;
  value: any;
  onChange: (value: any) => void;
}) {
  const [library, setLibrary] = useState<any[] | null>(null);
  const [error, setError] = useState('');
  const { type = 'text', label } = field;
  const htmlId = useId();
  if (type === 'boolean')
    return (
      <label className="checkbox-field">
        <input
          type="checkbox"
          checked={value === undefined ? false : !!value}
          onChange={(e) => onChange(e.target.checked)}
        />
        <span>{label}</span>
      </label>
    );
  if (type === 'array')
    return (
      <fieldset className="array-field">
        <legend>{label}</legend>
        {(value || []).map((item: any, i: number) => (
          <div className="array-item" key={i}>
            <div className="array-toolbar">
              <span>Item {i + 1}</span>
              <button
                type="button"
                aria-label="Move up"
                disabled={i === 0}
                onClick={() => {
                  const copy = [...value];
                  [copy[i - 1], copy[i]] = [copy[i], copy[i - 1]];
                  onChange(copy);
                }}
              >
                <ArrowUp size={14} />
              </button>
              <button
                type="button"
                aria-label="Move down"
                disabled={i === value.length - 1}
                onClick={() => {
                  const copy = [...value];
                  [copy[i + 1], copy[i]] = [copy[i], copy[i + 1]];
                  onChange(copy);
                }}
              >
                <ArrowDown size={14} />
              </button>
              <button
                type="button"
                aria-label="Remove item"
                onClick={() => onChange(value.filter((_: any, j: number) => i !== j))}
              >
                <Trash2 size={14} />
              </button>
            </div>
            {field.fields?.map((f) => (
              <FormField
                key={f.key}
                field={f}
                value={item[f.key]}
                onChange={(v) =>
                  onChange(value.map((r: any, j: number) => (i === j ? { ...r, [f.key]: v } : r)))
                }
              />
            ))}
          </div>
        ))}
        <button className="subtle" type="button" onClick={() => onChange([...(value || []), {}])}>
          <Plus size={15} />
          Add item
        </button>
      </fieldset>
    );
  return (
    <div className={'field ' + (type === 'rich' || type === 'textarea' ? 'wide' : '')}>
      <label htmlFor={htmlId}>{label}</label>
      {type === 'rich' ? (
        <RichEditor label={label} value={value || ''} onChange={onChange} />
      ) : type === 'select' ? (
        <select id={htmlId} value={value || ''} onChange={(e) => onChange(e.target.value)}>
          <option value="">Choose…</option>
          {field.options?.map((o) => (
            <option key={o}>{o}</option>
          ))}
        </select>
      ) : type === 'textarea' ? (
        <textarea
          id={htmlId}
          rows={4}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : type === 'tags' ? (
        <input
          id={htmlId}
          value={(value || []).join(', ')}
          onChange={(e) => onChange(e.target.value.split(',').map((t) => t.trimStart()))}
          onBlur={() => onChange((value || []).map((v: string) => v.trim()).filter(Boolean))}
          placeholder="Separate items with commas"
        />
      ) : (
        <input
          id={htmlId}
          type={type === 'number' ? 'number' : type === 'color' ? 'color' : 'text'}
          step={type === 'number' ? 'any' : undefined}
          value={value ?? (type === 'color' ? '#060b17' : '')}
          onChange={(e) => onChange(type === 'number' ? Number(e.target.value) : e.target.value)}
        />
      )}{' '}
      {type === 'media' && (
        <>
          <button
            type="button"
            className="media-select"
            onClick={async () => {
              try {
                const r = await request('/admin/media?limit=100');
                setLibrary(r.data);
              } catch (e) {
                setError((e as Error).message);
              }
            }}
          >
            <Image size={14} />
            Choose from media library
          </button>
          {value && /\.(png|jpe?g|webp|gif)/i.test(value) && (
            <img className="field-preview" src={value} alt="Selected asset" />
          )}
          {library && (
            <div className="media-picker">
              <div>
                <strong>Choose an asset</strong>
                <button type="button" onClick={() => setLibrary(null)}>
                  Close
                </button>
              </div>
              {library.length === 0 && <p>Upload files in Media library first.</p>}
              {library.map((m) => (
                <button
                  type="button"
                  key={m._id}
                  onClick={() => {
                    onChange(m.url);
                    setLibrary(null);
                  }}
                >
                  {m.mime?.startsWith('image') && <img src={m.url} alt={m.alt || m.name} />}
                  <span>{m.name}</span>
                </button>
              ))}
            </div>
          )}
        </>
      )}
      {error && <small className="error">{error}</small>}
      {field.hint && <small>{field.hint}</small>}
    </div>
  );
}
