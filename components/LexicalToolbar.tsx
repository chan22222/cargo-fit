import React, { useCallback, useEffect, useState } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
  $getSelection,
  $isRangeSelection,
  FORMAT_TEXT_COMMAND,
  FORMAT_ELEMENT_COMMAND,
  UNDO_COMMAND,
  REDO_COMMAND,
} from 'lexical';
import {
  $createHeadingNode,
  $createQuoteNode,
} from '@lexical/rich-text';
import {
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
} from '@lexical/list';
import { $setBlocksType } from '@lexical/selection';
import { $createParagraphNode } from 'lexical';

const ToolbarPlugin = () => {
  const [editor] = useLexicalComposerContext();
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [isStrike, setIsStrike] = useState(false);

  const updateToolbar = useCallback(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      setIsBold(selection.hasFormat('bold'));
      setIsItalic(selection.hasFormat('italic'));
      setIsUnderline(selection.hasFormat('underline'));
      setIsStrike(selection.hasFormat('strikethrough'));
    }
  }, []);

  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        updateToolbar();
      });
    });
  }, [editor, updateToolbar]);

  const formatHeading = (headingSize: 'h1' | 'h2' | 'h3') => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        $setBlocksType(selection, () => $createHeadingNode(headingSize));
      }
    });
  };

  const formatParagraph = () => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        $setBlocksType(selection, () => $createParagraphNode());
      }
    });
  };

  const formatQuote = () => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        $setBlocksType(selection, () => $createQuoteNode());
      }
    });
  };

  return (
    <div className="flex flex-wrap items-center gap-1 p-2 border-b border-gray-300 bg-gray-50">
      {/* Undo/Redo */}
      <button
        onClick={() => editor.dispatchCommand(UNDO_COMMAND, undefined)}
        className="p-2 hover:bg-gray-200 rounded"
        title="실행 취소"
      >
        ↶
      </button>
      <button
        onClick={() => editor.dispatchCommand(REDO_COMMAND, undefined)}
        className="p-2 hover:bg-gray-200 rounded"
        title="다시 실행"
      >
        ↷
      </button>

      <div className="w-px h-6 bg-gray-300 mx-1" />

      {/* Format Type */}
      <select
        onChange={(e) => {
          const value = e.target.value;
          if (value === 'paragraph') formatParagraph();
          else if (value === 'h1') formatHeading('h1');
          else if (value === 'h2') formatHeading('h2');
          else if (value === 'h3') formatHeading('h3');
          else if (value === 'quote') formatQuote();
        }}
        className="px-2 py-1 border border-gray-300 rounded"
      >
        <option value="paragraph">본문</option>
        <option value="h1">제목 1</option>
        <option value="h2">제목 2</option>
        <option value="h3">제목 3</option>
        <option value="quote">인용문</option>
      </select>

      <div className="w-px h-6 bg-gray-300 mx-1" />

      {/* Text Format */}
      <button
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold')}
        className={`p-2 hover:bg-gray-200 rounded font-bold ${isBold ? 'bg-gray-300' : ''}`}
        title="굵게"
      >
        B
      </button>
      <button
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic')}
        className={`p-2 hover:bg-gray-200 rounded italic ${isItalic ? 'bg-gray-300' : ''}`}
        title="기울임"
      >
        I
      </button>
      <button
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'underline')}
        className={`p-2 hover:bg-gray-200 rounded underline ${isUnderline ? 'bg-gray-300' : ''}`}
        title="밑줄"
      >
        U
      </button>
      <button
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'strikethrough')}
        className={`p-2 hover:bg-gray-200 rounded line-through ${isStrike ? 'bg-gray-300' : ''}`}
        title="취소선"
      >
        S
      </button>

      <div className="w-px h-6 bg-gray-300 mx-1" />

      {/* Alignment */}
      <button
        onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'left')}
        className="p-2 hover:bg-gray-200 rounded"
        title="왼쪽 정렬"
      >
        ◀
      </button>
      <button
        onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'center')}
        className="p-2 hover:bg-gray-200 rounded"
        title="가운데 정렬"
      >
        ■
      </button>
      <button
        onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'right')}
        className="p-2 hover:bg-gray-200 rounded"
        title="오른쪽 정렬"
      >
        ▶
      </button>

      <div className="w-px h-6 bg-gray-300 mx-1" />

      {/* Lists */}
      <button
        onClick={() => editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined)}
        className="p-2 hover:bg-gray-200 rounded"
        title="글머리 기호"
      >
        •
      </button>
      <button
        onClick={() => editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined)}
        className="p-2 hover:bg-gray-200 rounded"
        title="번호 매기기"
      >
        1.
      </button>
    </div>
  );
};

export default ToolbarPlugin;