import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useEffect, useState } from 'react';
import { Bold, Code, Heading2, Image as ImageIcon, Italic, Link as LinkIcon, List, Quote, CircleHelp, Unlink } from 'lucide-react';
import { cn } from '../../lib/utils';
import { PromptModal } from './AdminModal';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export default function RichTextEditor({ value, onChange }: RichTextEditorProps) {
  const [linkModalOpen, setLinkModalOpen] = useState(false);
  const [imageModalOpen, setImageModalOpen] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({ openOnClick: false, HTMLAttributes: { rel: 'noopener noreferrer', target: '_blank' } }),
      Image.configure({ inline: false }),
    ],
    content: value,
    editorProps: {
      attributes: {
        class:
          'min-h-[240px] rounded-b-2xl bg-[#090a0f] p-5 text-sm leading-relaxed text-white/85 outline-none prose prose-invert max-w-none focus:ring-1 focus:ring-brand-primary/40',
      },
    },
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  });

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || '<p></p>', { emitUpdate: false });
    }
  }, [editor, value]);

  if (!editor) return null;

  const handleSetLink = (url: string) => {
    if (url) {
      editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    }
  };

  const handleRemoveLink = () => {
    editor.chain().focus().unsetLink().run();
  };

  const handleSetImage = (url: string) => {
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  const tools = [
    { label: 'Bold', icon: Bold, active: editor.isActive('bold'), onClick: () => editor.chain().focus().toggleBold().run() },
    { label: 'Italic', icon: Italic, active: editor.isActive('italic'), onClick: () => editor.chain().focus().toggleItalic().run() },
    { label: 'Heading 2', icon: Heading2, active: editor.isActive('heading', { level: 2 }), onClick: () => editor.chain().focus().toggleHeading({ level: 2 }).run() },
    { label: 'Bullet List', icon: List, active: editor.isActive('bulletList'), onClick: () => editor.chain().focus().toggleBulletList().run() },
    { label: 'Quote', icon: Quote, active: editor.isActive('blockquote'), onClick: () => editor.chain().focus().toggleBlockquote().run() },
    { label: 'Code Block', icon: Code, active: editor.isActive('codeBlock'), onClick: () => editor.chain().focus().toggleCodeBlock().run() },
    { label: 'Insert Link', icon: LinkIcon, active: editor.isActive('link'), onClick: () => setLinkModalOpen(true) },
    { label: 'Insert Image', icon: ImageIcon, active: false, onClick: () => setImageModalOpen(true) },
  ];

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#08080c] shadow-lg transition-all focus-within:border-brand-primary/40 focus-within:shadow-[0_0_24px_rgba(61,90,254,0.12)]">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-1.5 border-b border-white/[0.08] bg-white/[0.025] px-3 py-2.5 backdrop-blur-md">
        <div className="flex flex-wrap items-center gap-1.5">
          {tools.map((tool) => (
            <button
              key={tool.label}
              type="button"
              onClick={tool.onClick}
              title={tool.label}
              className={cn(
                'flex h-8 w-8 items-center justify-center rounded-lg border text-white/50 transition-all hover:scale-105 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary',
                tool.active
                  ? 'border-brand-primary/40 bg-brand-primary/20 text-brand-primary shadow-[0_0_12px_rgba(61,90,254,0.3)]'
                  : 'border-white/5 bg-white/[0.02] hover:border-white/15 hover:bg-white/[0.06]'
              )}
              aria-label={tool.label}
            >
              <tool.icon className="h-4 w-4" />
            </button>
          ))}
          {editor.isActive('link') && (
            <button
              type="button"
              onClick={handleRemoveLink}
              title="Remove link"
              className="flex h-8 items-center gap-1.5 rounded-lg border border-red-500/20 bg-red-500/10 px-2.5 text-xs font-semibold text-red-300 transition hover:bg-red-500/20"
            >
              <Unlink className="h-3.5 w-3.5" /> Remove link
            </button>
          )}
        </div>
        <div className="hidden items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-white/30 sm:flex">
          <CircleHelp className="h-3 w-3 text-brand-primary/60" /> Formatted text
        </div>
      </div>

      {/* Editor Content Area */}
      <EditorContent editor={editor} />

      {/* Custom Prompt Modals instead of window.prompt */}
      <PromptModal
        isOpen={linkModalOpen}
        onClose={() => setLinkModalOpen(false)}
        onSubmit={handleSetLink}
        title="Insert Link"
        subtitle="Provide the destination URL for the highlighted text or cursor position."
        placeholder="https://example.com"
        initialValue={editor.getAttributes('link').href || ''}
        label="URL Address"
        submitText="Add Link"
        inputType="url"
      />

      <PromptModal
        isOpen={imageModalOpen}
        onClose={() => setImageModalOpen(false)}
        onSubmit={handleSetImage}
        title="Insert Image"
        subtitle="Paste an image URL to embed it directly into the rich text."
        placeholder="https://example.com/image.webp"
        label="Image Web URL"
        submitText="Embed Image"
        inputType="url"
      />
    </div>
  );
}
