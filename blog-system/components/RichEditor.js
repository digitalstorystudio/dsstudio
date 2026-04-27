'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Placeholder from '@tiptap/extension-placeholder';
import CharacterCount from '@tiptap/extension-character-count';

export default function RichEditor({ content, onChange }) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Image.configure({ inline: false, allowBase64: true }),
      Link.configure({ openOnClick: false, HTMLAttributes: { target: '_blank', rel: 'noopener noreferrer' } }),
      Underline,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Placeholder.configure({ placeholder: 'Start writing your blog post here...\n\nTip: Use the toolbar above to add headings, bold, links, and images.' }),
      CharacterCount,
    ],
    content: content || '',
    onUpdate({ editor }) {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: { class: 'rich-editor-content' },
    },
  });

  if (!editor) return null;

  const toolbarGroups = [
    // Text formatting
    [
      { action: () => editor.chain().focus().toggleBold().run(), label: 'B', title: 'Bold', style: { fontWeight: 900 }, active: editor.isActive('bold') },
      { action: () => editor.chain().focus().toggleItalic().run(), label: 'I', title: 'Italic', style: { fontStyle: 'italic' }, active: editor.isActive('italic') },
      { action: () => editor.chain().focus().toggleUnderline().run(), label: 'U', title: 'Underline', style: { textDecoration: 'underline' }, active: editor.isActive('underline') },
      { action: () => editor.chain().focus().toggleStrike().run(), label: 'S̶', title: 'Strikethrough', active: editor.isActive('strike') },
    ],
    // Headings
    [
      { action: () => editor.chain().focus().toggleHeading({ level: 1 }).run(), label: 'H1', title: 'Heading 1', active: editor.isActive('heading', { level: 1 }) },
      { action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(), label: 'H2', title: 'Heading 2', active: editor.isActive('heading', { level: 2 }) },
      { action: () => editor.chain().focus().toggleHeading({ level: 3 }).run(), label: 'H3', title: 'Heading 3', active: editor.isActive('heading', { level: 3 }) },
    ],
    // Lists
    [
      { action: () => editor.chain().focus().toggleBulletList().run(), label: '• List', title: 'Bullet List', active: editor.isActive('bulletList') },
      { action: () => editor.chain().focus().toggleOrderedList().run(), label: '1. List', title: 'Ordered List', active: editor.isActive('orderedList') },
      { action: () => editor.chain().focus().toggleBlockquote().run(), label: '❝', title: 'Blockquote', active: editor.isActive('blockquote') },
    ],
    // Alignment
    [
      { action: () => editor.chain().focus().setTextAlign('left').run(), label: '⬛', title: 'Align Left', active: editor.isActive({ textAlign: 'left' }) },
      { action: () => editor.chain().focus().setTextAlign('center').run(), label: '▩', title: 'Align Center', active: editor.isActive({ textAlign: 'center' }) },
      { action: () => editor.chain().focus().setTextAlign('right').run(), label: '▪', title: 'Align Right', active: editor.isActive({ textAlign: 'right' }) },
    ],
  ];

  function addLink() {
    const url = window.prompt('Enter URL:');
    if (url) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  }

  function addImage() {
    const url = window.prompt('Enter image URL:');
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  }

  function addHr() {
    editor.chain().focus().setHorizontalRule().run();
  }

  const wordCount = editor.storage.characterCount?.words() || 0;
  const charCount = editor.storage.characterCount?.characters() || 0;

  return (
    <div>
      {/* Toolbar */}
      <div style={{
        display: 'flex', flexWrap: 'wrap', gap: '0.5rem', padding: '0.75rem 1rem',
        background: 'rgba(0,0,0,0.4)', borderBottom: '1px solid rgba(0,240,255,0.1)',
        alignItems: 'center',
      }}>
        {toolbarGroups.map((group, gi) => (
          <div key={gi} style={{ display: 'flex', gap: '2px', marginRight: '0.5rem' }}>
            {group.map((btn, bi) => (
              <button
                key={bi}
                type="button"
                title={btn.title}
                onClick={btn.action}
                style={{
                  padding: '5px 10px',
                  borderRadius: '5px',
                  border: btn.active ? '1px solid rgba(0,240,255,0.5)' : '1px solid transparent',
                  background: btn.active ? 'rgba(0,240,255,0.15)' : 'rgba(255,255,255,0.05)',
                  color: btn.active ? '#00f0ff' : '#b0b0ff',
                  cursor: 'pointer',
                  fontSize: '0.8rem',
                  fontFamily: 'Montserrat',
                  fontWeight: 600,
                  transition: 'all 0.15s',
                  minWidth: '32px',
                  ...btn.style,
                }}
                onMouseEnter={e => { if (!btn.active) e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; }}
                onMouseLeave={e => { if (!btn.active) e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
              >
                {btn.label}
              </button>
            ))}
          </div>
        ))}

        {/* Special buttons */}
        <div style={{ display: 'flex', gap: '2px' }}>
          <button type="button" onClick={addLink} title="Add Link"
            style={{ padding: '5px 10px', borderRadius: '5px', border: editor.isActive('link') ? '1px solid rgba(0,240,255,0.5)' : '1px solid transparent', background: editor.isActive('link') ? 'rgba(0,240,255,0.15)' : 'rgba(255,255,255,0.05)', color: editor.isActive('link') ? '#00f0ff' : '#b0b0ff', cursor: 'pointer', fontSize: '0.8rem', fontFamily: 'Montserrat', fontWeight: 600 }}>
            🔗 Link
          </button>
          <button type="button" onClick={addImage} title="Add Image"
            style={{ padding: '5px 10px', borderRadius: '5px', border: '1px solid transparent', background: 'rgba(255,255,255,0.05)', color: '#b0b0ff', cursor: 'pointer', fontSize: '0.8rem', fontFamily: 'Montserrat', fontWeight: 600 }}>
            🖼️ Image
          </button>
          <button type="button" onClick={addHr} title="Divider"
            style={{ padding: '5px 10px', borderRadius: '5px', border: '1px solid transparent', background: 'rgba(255,255,255,0.05)', color: '#b0b0ff', cursor: 'pointer', fontSize: '0.8rem', fontFamily: 'Montserrat', fontWeight: 600 }}>
            ── HR
          </button>
        </div>

        {/* Undo/Redo */}
        <div style={{ display: 'flex', gap: '2px', marginLeft: 'auto' }}>
          <button type="button" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()}
            style={{ padding: '5px 8px', borderRadius: '5px', border: '1px solid transparent', background: 'rgba(255,255,255,0.05)', color: '#b0b0ff', cursor: 'pointer', fontSize: '0.85rem', opacity: editor.can().undo() ? 1 : 0.3 }}>
            ↩
          </button>
          <button type="button" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()}
            style={{ padding: '5px 8px', borderRadius: '5px', border: '1px solid transparent', background: 'rgba(255,255,255,0.05)', color: '#b0b0ff', cursor: 'pointer', fontSize: '0.85rem', opacity: editor.can().redo() ? 1 : 0.3 }}>
            ↪
          </button>
        </div>
      </div>

      {/* Editor area */}
      <EditorContent
        editor={editor}
        style={{ minHeight: '400px', padding: '1rem', outline: 'none' }}
      />

      {/* Word count */}
      <div style={{
        padding: '0.5rem 1rem', borderTop: '1px solid rgba(0,240,255,0.08)',
        display: 'flex', gap: '1.5rem',
        background: 'rgba(0,0,0,0.2)',
      }}>
        <span style={{ color: 'rgba(176,176,255,0.5)', fontFamily: 'Montserrat', fontSize: '0.75rem' }}>
          {wordCount} words
        </span>
        <span style={{ color: 'rgba(176,176,255,0.5)', fontFamily: 'Montserrat', fontSize: '0.75rem' }}>
          {charCount} characters
        </span>
      </div>
    </div>
  );
}
