import React, { useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import Placeholder from '@tiptap/extension-placeholder';
import { Extension } from '@tiptap/core';

// Custom extension for text styling (letter-spacing and line-height)
const TextStyle = Extension.create({
  name: 'textStyle',

  addGlobalAttributes() {
    return [
      {
        types: ['heading', 'paragraph'],
        attributes: {
          letterSpacing: {
            default: null,
            parseHTML: element => element.style.letterSpacing || null,
            renderHTML: attributes => {
              if (!attributes.letterSpacing) {
                return {};
              }
              return {
                style: `letter-spacing: ${attributes.letterSpacing}`,
              };
            },
          },
          lineHeight: {
            default: null,
            parseHTML: element => element.style.lineHeight || null,
            renderHTML: attributes => {
              if (!attributes.lineHeight) {
                return {};
              }
              return {
                style: `line-height: ${attributes.lineHeight}`,
              };
            },
          },
        },
      },
    ];
  },

  addCommands() {
    return {
      setLetterSpacing: (spacing: string) => ({ commands, editor }) => {
        return editor.chain().focus().updateAttributes('paragraph', { letterSpacing: spacing }).run();
      },
      setLineHeight: (height: string) => ({ commands, editor }) => {
        return editor.chain().focus().updateAttributes('paragraph', { lineHeight: height }).run();
      },
      unsetTextStyle: () => ({ commands, editor }) => {
        return editor.chain().focus().resetAttributes('paragraph', ['letterSpacing', 'lineHeight']).run();
      },
    };
  },
});

interface TiptapEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const MenuBar = ({ editor, isHtmlMode, onToggleHtmlMode }: {
  editor: any;
  isHtmlMode: boolean;
  onToggleHtmlMode: () => void;
}) => {
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
        type="button"
        onClick={(e) => { e.preventDefault(); editor.chain().focus().undo().run(); }}
        disabled={!editor.can().chain().focus().undo().run()}
        className="p-2 hover:bg-gray-200 rounded disabled:opacity-50"
        title="실행 취소"
      >
        ↶
      </button>
      <button
        type="button"
        onClick={(e) => { e.preventDefault(); editor.chain().focus().redo().run(); }}
        disabled={!editor.can().chain().focus().redo().run()}
        className="p-2 hover:bg-gray-200 rounded disabled:opacity-50"
        title="다시 실행"
      >
        ↷
      </button>

      <div className="w-px h-6 bg-gray-300 mx-1" />

      {/* Heading */}
      <button
        type="button"
        onClick={(e) => { e.preventDefault(); editor.chain().focus().toggleHeading({ level: 1 }).run(); }}
        className={`p-2 hover:bg-gray-200 rounded ${
          editor.isActive('heading', { level: 1 }) ? 'bg-gray-300' : ''
        }`}
        title="제목 1"
      >
        H1
      </button>
      <button
        type="button"
        onClick={(e) => { e.preventDefault(); editor.chain().focus().toggleHeading({ level: 2 }).run(); }}
        className={`p-2 hover:bg-gray-200 rounded ${
          editor.isActive('heading', { level: 2 }) ? 'bg-gray-300' : ''
        }`}
        title="제목 2"
      >
        H2
      </button>
      <button
        type="button"
        onClick={(e) => { e.preventDefault(); editor.chain().focus().toggleHeading({ level: 3 }).run(); }}
        className={`p-2 hover:bg-gray-200 rounded ${
          editor.isActive('heading', { level: 3 }) ? 'bg-gray-300' : ''
        }`}
        title="제목 3"
      >
        H3
      </button>
      <button
        type="button"
        onClick={(e) => { e.preventDefault(); editor.chain().focus().setParagraph().run(); }}
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
        type="button"
        onClick={(e) => { e.preventDefault(); editor.chain().focus().toggleBold().run(); }}
        disabled={!editor.can().chain().focus().toggleBold().run()}
        className={`p-2 hover:bg-gray-200 rounded font-bold disabled:opacity-50 ${
          editor.isActive('bold') ? 'bg-gray-300' : ''
        }`}
        title="굵게"
      >
        B
      </button>
      <button
        type="button"
        onClick={(e) => { e.preventDefault(); editor.chain().focus().toggleItalic().run(); }}
        disabled={!editor.can().chain().focus().toggleItalic().run()}
        className={`p-2 hover:bg-gray-200 rounded italic disabled:opacity-50 ${
          editor.isActive('italic') ? 'bg-gray-300' : ''
        }`}
        title="기울임"
      >
        I
      </button>
      <button
        type="button"
        onClick={(e) => { e.preventDefault(); editor.chain().focus().toggleUnderline().run(); }}
        className={`p-2 hover:bg-gray-200 rounded underline ${
          editor.isActive('underline') ? 'bg-gray-300' : ''
        }`}
        title="밑줄"
      >
        U
      </button>
      <button
        type="button"
        onClick={(e) => { e.preventDefault(); editor.chain().focus().toggleStrike().run(); }}
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
        type="button"
        onClick={(e) => { e.preventDefault(); editor.chain().focus().setTextAlign('left').run(); }}
        className={`p-2 hover:bg-gray-200 rounded ${
          editor.isActive({ textAlign: 'left' }) ? 'bg-gray-300' : ''
        }`}
        title="왼쪽 정렬"
      >
        ◀
      </button>
      <button
        type="button"
        onClick={(e) => { e.preventDefault(); editor.chain().focus().setTextAlign('center').run(); }}
        className={`p-2 hover:bg-gray-200 rounded ${
          editor.isActive({ textAlign: 'center' }) ? 'bg-gray-300' : ''
        }`}
        title="가운데 정렬"
      >
        ■
      </button>
      <button
        type="button"
        onClick={(e) => { e.preventDefault(); editor.chain().focus().setTextAlign('right').run(); }}
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
        type="button"
        onClick={(e) => { e.preventDefault(); editor.chain().focus().toggleBulletList().run(); }}
        className={`p-2 hover:bg-gray-200 rounded ${
          editor.isActive('bulletList') ? 'bg-gray-300' : ''
        }`}
        title="글머리 기호"
      >
        •
      </button>
      <button
        type="button"
        onClick={(e) => { e.preventDefault(); editor.chain().focus().toggleOrderedList().run(); }}
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
        type="button"
        onClick={(e) => { e.preventDefault(); editor.chain().focus().toggleBlockquote().run(); }}
        className={`p-2 hover:bg-gray-200 rounded ${
          editor.isActive('blockquote') ? 'bg-gray-300' : ''
        }`}
        title="인용문"
      >
        "
      </button>

      <button
        type="button"
        onClick={(e) => { e.preventDefault(); editor.chain().focus().setHorizontalRule().run(); }}
        className="p-2 hover:bg-gray-200 rounded"
        title="구분선"
      >
        ─
      </button>

      <div className="w-px h-6 bg-gray-300 mx-1" />

      {/* Text Spacing */}
      <div className="flex items-center gap-1">
        <select
          className="px-2 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100"
          onChange={(e) => {
            e.preventDefault();
            const value = e.target.value;
            if (value === 'normal') {
              editor.chain()
                .focus()
                .updateAttributes('paragraph', { letterSpacing: null })
                .updateAttributes('heading', { letterSpacing: null })
                .run();
            } else {
              editor.chain()
                .focus()
                .updateAttributes('paragraph', { letterSpacing: value })
                .updateAttributes('heading', { letterSpacing: value })
                .run();
            }
          }}
          title="자간 (Letter Spacing)"
        >
          <option value="normal">자간</option>
          <option value="-0.05em">좁게</option>
          <option value="0.05em">약간 넓게</option>
          <option value="0.1em">넓게</option>
          <option value="0.2em">매우 넓게</option>
        </select>

        <select
          className="px-2 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100"
          onChange={(e) => {
            e.preventDefault();
            const value = e.target.value;
            if (value === 'normal') {
              editor.chain()
                .focus()
                .updateAttributes('paragraph', { lineHeight: null })
                .updateAttributes('heading', { lineHeight: null })
                .run();
            } else {
              editor.chain()
                .focus()
                .updateAttributes('paragraph', { lineHeight: value })
                .updateAttributes('heading', { lineHeight: value })
                .run();
            }
          }}
          title="줄 높이 (Line Height)"
        >
          <option value="normal">줄높이</option>
          <option value="1.2">좁게</option>
          <option value="1.5">보통</option>
          <option value="1.8">넓게</option>
          <option value="2.0">더블</option>
          <option value="2.5">매우 넓게</option>
        </select>
      </div>

      <div className="w-px h-6 bg-gray-300 mx-1" />

      {/* Media */}
      <button
        type="button"
        onClick={addImage}
        className="p-2 hover:bg-gray-200 rounded"
        title="이미지 삽입"
      >
        🖼️
      </button>
      <button
        type="button"
        onClick={setLink}
        className={`p-2 hover:bg-gray-200 rounded ${
          editor.isActive('link') ? 'bg-gray-300' : ''
        }`}
        title="링크 삽입"
      >
        🔗
      </button>

      <div className="w-px h-6 bg-gray-300 mx-1" />

      {/* HTML Toggle */}
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          onToggleHtmlMode();
        }}
        className={`px-3 py-1 text-sm font-medium rounded ${
          isHtmlMode
            ? 'bg-gray-800 text-white'
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
        }`}
        title="HTML 소스 편집"
      >
        &lt;/&gt; HTML
      </button>
    </div>
  );
};

const TiptapEditor: React.FC<TiptapEditorProps> = ({ value, onChange, placeholder }) => {
  const [isHtmlMode, setIsHtmlMode] = useState(false);
  const [htmlContent, setHtmlContent] = useState(value);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        // StarterKit에 포함된 extensions 중 일부를 비활성화
        dropcursor: false,
        gapcursor: false,
        // Paragraph 설정 추가
        paragraph: {
          HTMLAttributes: {
            class: 'mb-4',
          },
        },
        // Hard break 설정 (Shift+Enter)
        hardBreak: {
          keepMarks: true,
        },
      }),
      TextStyle, // Add custom text styling extension
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
      setHtmlContent(value);
    }
  }, [value, editor]);

  // Function to format HTML with proper indentation
  const formatHtml = (html: string): string => {
    let formatted = '';
    let indent = 0;

    // Split by tags and process each part
    const parts = html.split(/(<[^>]+>)/);

    parts.forEach(part => {
      if (part.match(/^<\/\w/)) { // Closing tag
        indent = Math.max(0, indent - 1);
      }

      if (part.trim()) {
        formatted += '  '.repeat(indent) + part.trim() + '\n';
      }

      if (part.match(/^<\w[^>]*[^\/]>$/) && !part.match(/^<(br|hr|img|input|link|meta|area|base|col|embed|source|track|wbr)/)) { // Opening tag (not self-closing)
        indent++;
      }
    });

    return formatted.trim();
  };

  // Handle toggling between WYSIWYG and HTML mode
  const handleToggleHtmlMode = () => {
    if (isHtmlMode) {
      // Switch from HTML to WYSIWYG
      if (editor) {
        editor.commands.setContent(htmlContent);
        onChange(htmlContent);
      }
    } else {
      // Switch from WYSIWYG to HTML
      if (editor) {
        const formattedHtml = formatHtml(editor.getHTML());
        setHtmlContent(formattedHtml);
      }
    }
    setIsHtmlMode(!isHtmlMode);
  };

  // Handle HTML content changes
  const handleHtmlChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newHtml = e.target.value;
    setHtmlContent(newHtml);
    onChange(newHtml);
  };

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden">
      <MenuBar editor={editor} isHtmlMode={isHtmlMode} onToggleHtmlMode={handleToggleHtmlMode} />
      {isHtmlMode ? (
        <textarea
          className="w-full min-h-[400px] max-h-[600px] p-4 font-mono text-sm bg-gray-900 text-green-400 focus:outline-none resize-y"
          value={htmlContent}
          onChange={handleHtmlChange}
          placeholder="HTML 소스 코드를 입력하세요..."
        />
      ) : (
        <EditorContent editor={editor} />
      )}
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