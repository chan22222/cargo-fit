import React, { useState, useEffect } from 'react';
import 'react-quill/dist/quill.snow.css';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({ value, onChange, placeholder }) => {
  const [QuillComponent, setQuillComponent] = useState<any>(null);

  useEffect(() => {
    // Dynamically import react-quill to avoid SSR issues and React 19 compatibility
    import('react-quill').then((module) => {
      setQuillComponent(() => module.default);
    });
  }, []);

  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      ['blockquote', 'code-block'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'align': [] }],
      [{ 'color': [] }, { 'background': [] }],
      ['link', 'image'],
      ['clean']
    ],
  };

  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'blockquote', 'code-block',
    'list', 'bullet',
    'align',
    'color', 'background',
    'link', 'image'
  ];

  if (!QuillComponent) {
    return (
      <div className="h-64 mb-12 border border-gray-300 rounded-lg p-4 bg-gray-50 flex items-center justify-center">
        <span className="text-gray-500">에디터 로딩 중...</span>
      </div>
    );
  }

  return (
    <div className="rich-text-editor">
      <QuillComponent
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder || '내용을 입력하세요...'}
        className="h-64 mb-12"
      />
    </div>
  );
};

export default RichTextEditor;