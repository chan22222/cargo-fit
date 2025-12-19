import React, { useRef, useEffect, useMemo } from 'react';

interface QuillEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const QuillEditor: React.FC<QuillEditorProps> = ({ value, onChange, placeholder }) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const quillRef = useRef<any>(null);
  const isInternalChange = useRef(false);

  const modules = useMemo(() => ({
    toolbar: {
      container: [
        [{ 'header': [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'color': [] }, { 'background': [] }],
        ['blockquote', 'code-block'],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        [{ 'align': [] }],
        ['link', 'image', 'video'],
        ['clean']
      ]
    }
  }), []);

  useEffect(() => {
    if (!editorRef.current || quillRef.current) return;

    const loadQuill = async () => {
      // Dynamically import Quill (not react-quill) to avoid React 19 issues
      const Quill = (await import('quill')).default;

      // Initialize Quill on the div element
      quillRef.current = new Quill(editorRef.current!, {
        theme: 'snow',
        placeholder: placeholder || '내용을 입력하세요...',
        modules: modules
      });

      // Set initial content
      if (value) {
        quillRef.current.root.innerHTML = value;
      }

      // Handle text change
      quillRef.current.on('text-change', () => {
        if (!isInternalChange.current) {
          const html = quillRef.current.root.innerHTML;
          onChange(html === '<p><br></p>' ? '' : html);
        }
      });
    };

    loadQuill();

    return () => {
      if (quillRef.current) {
        // Clean up
        const toolbar = editorRef.current?.previousSibling;
        toolbar?.remove();
      }
    };
  }, [modules, placeholder]);

  // Update content when value prop changes
  useEffect(() => {
    if (quillRef.current && value !== quillRef.current.root.innerHTML) {
      isInternalChange.current = true;
      quillRef.current.root.innerHTML = value || '';
      isInternalChange.current = false;
    }
  }, [value]);

  return (
    <div className="quill-editor-wrapper">
      <style>{`
        .quill-editor-wrapper .ql-toolbar {
          border: 1px solid #e5e7eb;
          border-radius: 0.5rem 0.5rem 0 0;
          background: #f9fafb;
        }
        .quill-editor-wrapper .ql-container {
          border: 1px solid #e5e7eb;
          border-top: 0;
          border-radius: 0 0 0.5rem 0.5rem;
          min-height: 200px;
          max-height: 400px;
          overflow-y: auto;
          font-size: 1rem;
        }
        .quill-editor-wrapper .ql-editor {
          min-height: 200px;
        }
        .quill-editor-wrapper .ql-editor.ql-blank::before {
          color: #9ca3af;
          font-style: normal;
        }
        .quill-editor-wrapper .ql-snow .ql-picker {
          color: #4b5563;
        }
        .quill-editor-wrapper .ql-snow .ql-stroke {
          stroke: #6b7280;
        }
        .quill-editor-wrapper .ql-snow .ql-fill {
          fill: #6b7280;
        }
        .quill-editor-wrapper .ql-snow button:hover .ql-stroke {
          stroke: #2563eb;
        }
        .quill-editor-wrapper .ql-snow button:hover .ql-fill {
          fill: #2563eb;
        }
        .quill-editor-wrapper .ql-snow button.ql-active .ql-stroke {
          stroke: #2563eb;
        }
        .quill-editor-wrapper .ql-snow button.ql-active .ql-fill {
          fill: #2563eb;
        }
      `}</style>
      <div ref={editorRef} />
    </div>
  );
};

export default QuillEditor;