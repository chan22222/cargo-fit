import React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import Placeholder from '@tiptap/extension-placeholder';

interface TiptapEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const MenuBar = ({ editor }: { editor: any }) => {
  if (!editor) {
    return null;
  }

  const addImage = (e: React.MouseEvent) => {
    e.preventDefault();
    const url = window.prompt('이미지 URL을 입력하세요');
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  const setLink = (e: React.MouseEvent) => {
    e.preventDefault();
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('링크 URL을 입력하세요', previousUrl);

    if (url === null) {
      return;
    }

    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  return (
    <div className="flex flex-wrap items-center gap-1 p-2 border-b border-gray-300 bg-gray-50">
      {/* Undo/Redo */}
      <button
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().chain().focus().undo().run()}
        className="p-2 hover:bg-gray-200 rounded disabled:opacity-50"
        title="실행 취소"
      >
        ↶
      </button>
      <button
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().chain().focus().redo().run()}
        className="p-2 hover:bg-gray-200 rounded disabled:opacity-50"
        title="다시 실행"
      >
        ↷
      </button>

      <div className="w-px h-6 bg-gray-300 mx-1" />

      {/* Heading */}
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={`p-2 hover:bg-gray-200 rounded ${
          editor.isActive('heading', { level: 1 }) ? 'bg-gray-300' : ''
        }`}
        title="제목 1"
      >
        H1
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={`p-2 hover:bg-gray-200 rounded ${
          editor.isActive('heading', { level: 2 }) ? 'bg-gray-300' : ''
        }`}
        title="제목 2"
      >
        H2
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        className={`p-2 hover:bg-gray-200 rounded ${
          editor.isActive('heading', { level: 3 }) ? 'bg-gray-300' : ''
        }`}
        title="제목 3"
      >
        H3
      </button>
      <button
        onClick={() => editor.chain().focus().setParagraph().run()}
        className={`p-2 hover:bg-gray-200 rounded ${
          editor.isActive('paragraph') ? 'bg-gray-300' : ''
        }`}
        title="본문"
      >
        P
      </button>

      <div className="w-px h-6 bg-gray-300 mx-1" />

      {/* Text Format */}
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        disabled={!editor.can().chain().focus().toggleBold().run()}
        className={`p-2 hover:bg-gray-200 rounded font-bold disabled:opacity-50 ${
          editor.isActive('bold') ? 'bg-gray-300' : ''
        }`}
        title="굵게"
      >
        B
      </button>
      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        disabled={!editor.can().chain().focus().toggleItalic().run()}
        className={`p-2 hover:bg-gray-200 rounded italic disabled:opacity-50 ${
          editor.isActive('italic') ? 'bg-gray-300' : ''
        }`}
        title="기울임"
      >
        I
      </button>
      <button
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        className={`p-2 hover:bg-gray-200 rounded underline ${
          editor.isActive('underline') ? 'bg-gray-300' : ''
        }`}
        title="밑줄"
      >
        U
      </button>
      <button
        onClick={() => editor.chain().focus().toggleStrike().run()}
        disabled={!editor.can().chain().focus().toggleStrike().run()}
        className={`p-2 hover:bg-gray-200 rounded line-through disabled:opacity-50 ${
          editor.isActive('strike') ? 'bg-gray-300' : ''
        }`}
        title="취소선"
      >
        S
      </button>

      <div className="w-px h-6 bg-gray-300 mx-1" />

      {/* Alignment */}
      <button
        onClick={() => editor.chain().focus().setTextAlign('left').run()}
        className={`p-2 hover:bg-gray-200 rounded ${
          editor.isActive({ textAlign: 'left' }) ? 'bg-gray-300' : ''
        }`}
        title="왼쪽 정렬"
      >
        ◀
      </button>
      <button
        onClick={() => editor.chain().focus().setTextAlign('center').run()}
        className={`p-2 hover:bg-gray-200 rounded ${
          editor.isActive({ textAlign: 'center' }) ? 'bg-gray-300' : ''
        }`}
        title="가운데 정렬"
      >
        ■
      </button>
      <button
        onClick={() => editor.chain().focus().setTextAlign('right').run()}
        className={`p-2 hover:bg-gray-200 rounded ${
          editor.isActive({ textAlign: 'right' }) ? 'bg-gray-300' : ''
        }`}
        title="오른쪽 정렬"
      >
        ▶
      </button>

      <div className="w-px h-6 bg-gray-300 mx-1" />

      {/* Lists */}
      <button
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`p-2 hover:bg-gray-200 rounded ${
          editor.isActive('bulletList') ? 'bg-gray-300' : ''
        }`}
        title="글머리 기호"
      >
        •
      </button>
      <button
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={`p-2 hover:bg-gray-200 rounded ${
          editor.isActive('orderedList') ? 'bg-gray-300' : ''
        }`}
        title="번호 매기기"
      >
        1.
      </button>

      <div className="w-px h-6 bg-gray-300 mx-1" />

      {/* Quote */}
      <button
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={`p-2 hover:bg-gray-200 rounded ${
          editor.isActive('blockquote') ? 'bg-gray-300' : ''
        }`}
        title="인용문"
      >
        "
      </button>

      <button
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
        className="p-2 hover:bg-gray-200 rounded"
        title="구분선"
      >
        ─
      </button>

      <div className="w-px h-6 bg-gray-300 mx-1" />

      {/* Media */}
      <button
        onClick={addImage}
        className="p-2 hover:bg-gray-200 rounded"
        title="이미지 삽입"
      >
        🖼️
      </button>
      <button
        onClick={setLink}
        className={`p-2 hover:bg-gray-200 rounded ${
          editor.isActive('link') ? 'bg-gray-300' : ''
        }`}
        title="링크 삽입"
      >
        🔗
      </button>
    </div>
  );
};

const TiptapEditor: React.FC<TiptapEditorProps> = ({ value, onChange, placeholder }) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        // StarterKit에 포함된 extensions 중 일부를 비활성화
        dropcursor: false,
        gapcursor: false,
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 underline hover:text-blue-800',
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'max-w-full h-auto rounded-lg',
        },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Placeholder.configure({
        placeholder: placeholder || '내용을 입력하세요...',
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'min-h-[200px] max-h-[400px] overflow-y-auto p-4 focus:outline-none prose prose-sm max-w-none',
      },
    },
  });

  // Update editor content when value prop changes
  React.useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value);
    }
  }, [value, editor]);

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden">
      <MenuBar editor={editor} />
      <EditorContent editor={editor} />
      <style>{`
        .ProseMirror {
          min-height: 200px;
          max-height: 400px;
          overflow-y: auto;
          padding: 1rem;
        }

        .ProseMirror:focus {
          outline: none;
        }

        .ProseMirror p.is-editor-empty:first-child::before {
          color: #9ca3af;
          content: attr(data-placeholder);
          float: left;
          height: 0;
          pointer-events: none;
        }

        .ProseMirror h1 {
          font-size: 1.875rem;
          font-weight: bold;
          margin-bottom: 1rem;
        }

        .ProseMirror h2 {
          font-size: 1.5rem;
          font-weight: bold;
          margin-bottom: 0.75rem;
        }

        .ProseMirror h3 {
          font-size: 1.25rem;
          font-weight: bold;
          margin-bottom: 0.5rem;
        }

        .ProseMirror p {
          margin-bottom: 0.5rem;
        }

        .ProseMirror ul,
        .ProseMirror ol {
          padding-left: 1.5rem;
          margin-bottom: 0.5rem;
        }

        .ProseMirror ul {
          list-style-type: disc;
        }

        .ProseMirror ol {
          list-style-type: decimal;
        }

        .ProseMirror blockquote {
          border-left: 4px solid #3b82f6;
          padding-left: 1rem;
          font-style: italic;
          margin: 1rem 0;
        }

        .ProseMirror img {
          max-width: 100%;
          height: auto;
          border-radius: 0.5rem;
        }

        .ProseMirror a {
          color: #3b82f6;
          text-decoration: underline;
        }

        .ProseMirror a:hover {
          color: #2563eb;
        }

        .ProseMirror hr {
          border: none;
          border-top: 2px solid #e5e7eb;
          margin: 1rem 0;
        }
      `}</style>
    </div>
  );
};

export default TiptapEditor;