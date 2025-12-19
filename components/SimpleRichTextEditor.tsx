import React, { useRef, useEffect } from 'react';

interface SimpleRichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const SimpleRichTextEditor: React.FC<SimpleRichTextEditorProps> = ({ value, onChange, placeholder }) => {
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || '';
    }
  }, [value]);

  const handleCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    handleChange();
  };

  const handleChange = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const handleImageUpload = () => {
    const url = prompt('이미지 URL을 입력하세요:');
    if (url) {
      handleCommand('insertImage', url);
    }
  };

  const handleLink = () => {
    const url = prompt('링크 URL을 입력하세요:');
    if (url) {
      handleCommand('createLink', url);
    }
  };

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden">
      {/* Toolbar */}
      <div className="bg-gray-50 border-b border-gray-300 p-2 flex flex-wrap gap-1">
        <select
          onChange={(e) => handleCommand('formatBlock', e.target.value)}
          className="px-2 py-1 border border-gray-300 rounded text-sm"
        >
          <option value="p">본문</option>
          <option value="h1">제목 1</option>
          <option value="h2">제목 2</option>
          <option value="h3">제목 3</option>
        </select>

        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => handleCommand('bold')}
            className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-200 font-bold"
            title="굵게"
          >
            B
          </button>
          <button
            type="button"
            onClick={() => handleCommand('italic')}
            className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-200 italic"
            title="기울임"
          >
            I
          </button>
          <button
            type="button"
            onClick={() => handleCommand('underline')}
            className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-200 underline"
            title="밑줄"
          >
            U
          </button>
          <button
            type="button"
            onClick={() => handleCommand('strikeThrough')}
            className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-200 line-through"
            title="취소선"
          >
            S
          </button>
        </div>

        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => handleCommand('justifyLeft')}
            className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-200"
            title="왼쪽 정렬"
          >
            ◀
          </button>
          <button
            type="button"
            onClick={() => handleCommand('justifyCenter')}
            className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-200"
            title="가운데 정렬"
          >
            ■
          </button>
          <button
            type="button"
            onClick={() => handleCommand('justifyRight')}
            className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-200"
            title="오른쪽 정렬"
          >
            ▶
          </button>
        </div>

        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => handleCommand('insertUnorderedList')}
            className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-200"
            title="글머리 기호"
          >
            •
          </button>
          <button
            type="button"
            onClick={() => handleCommand('insertOrderedList')}
            className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-200"
            title="번호 매기기"
          >
            1.
          </button>
        </div>

        <div className="flex gap-1">
          <button
            type="button"
            onClick={handleLink}
            className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-200"
            title="링크"
          >
            🔗
          </button>
          <button
            type="button"
            onClick={handleImageUpload}
            className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-200"
            title="이미지"
          >
            🖼️
          </button>
        </div>

        <input
          type="color"
          onChange={(e) => handleCommand('foreColor', e.target.value)}
          className="w-8 h-8 border border-gray-300 rounded cursor-pointer"
          title="글자색"
        />
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        className="p-4 min-h-[200px] max-h-[400px] overflow-y-auto focus:outline-none"
        onInput={handleChange}
        onBlur={handleChange}
        placeholder={placeholder}
        suppressContentEditableWarning={true}
        style={{ minHeight: '200px' }}
      />
    </div>
  );
};

export default SimpleRichTextEditor;