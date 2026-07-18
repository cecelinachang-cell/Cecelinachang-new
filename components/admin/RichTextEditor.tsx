'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import DOMPurify from 'dompurify';
import { Bold, Italic, List, ListOrdered, Link as LinkIcon, Unlink } from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

export function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({ openOnClick: false, autolink: true }),
      Placeholder.configure({ placeholder: placeholder || 'Write a description...' }),
    ],
    content: value,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class:
          'prose prose-sm max-w-none min-h-[150px] px-4 py-3 focus:outline-none',
      },
    },
    onUpdate: ({ editor }) => {
      onChange(DOMPurify.sanitize(editor.getHTML()));
    },
  });

  if (!editor) return null;

  const setLink = () => {
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('URL', previousUrl);
    if (url === null) return;
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  const buttonClass = (active: boolean) =>
    `p-2 rounded-lg transition-colors ${
      active ? 'bg-orange-100 text-orange-700' : 'text-stone-500 hover:bg-stone-100'
    }`;

  return (
    <div className="w-full rounded-xl border border-stone-300 focus-within:ring-2 focus-within:ring-orange-500 focus-within:border-transparent overflow-hidden">
      <div className="flex items-center gap-1 border-b border-stone-200 bg-stone-50 px-2 py-1.5">
        <button
          type="button"
          aria-label="Bold"
          aria-pressed={editor.isActive('bold')}
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={buttonClass(editor.isActive('bold'))}
        >
          <Bold className="w-4 h-4" />
        </button>
        <button
          type="button"
          aria-label="Italic"
          aria-pressed={editor.isActive('italic')}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={buttonClass(editor.isActive('italic'))}
        >
          <Italic className="w-4 h-4" />
        </button>
        <button
          type="button"
          aria-label="Bullet list"
          aria-pressed={editor.isActive('bulletList')}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={buttonClass(editor.isActive('bulletList'))}
        >
          <List className="w-4 h-4" />
        </button>
        <button
          type="button"
          aria-label="Numbered list"
          aria-pressed={editor.isActive('orderedList')}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={buttonClass(editor.isActive('orderedList'))}
        >
          <ListOrdered className="w-4 h-4" />
        </button>
        <button
          type="button"
          aria-label="Add link"
          aria-pressed={editor.isActive('link')}
          onClick={setLink}
          className={buttonClass(editor.isActive('link'))}
        >
          <LinkIcon className="w-4 h-4" />
        </button>
        {editor.isActive('link') && (
          <button
            type="button"
            aria-label="Remove link"
            onClick={() => editor.chain().focus().unsetLink().run()}
            className={buttonClass(false)}
          >
            <Unlink className="w-4 h-4" />
          </button>
        )}
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
