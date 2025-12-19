import React, { useEffect } from 'react';
import { $getRoot, $getSelection, $createParagraphNode, $createTextNode } from 'lexical';
import { $generateHtmlFromNodes, $generateNodesFromDOM } from '@lexical/html';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import LexicalErrorBoundary from '@lexical/react/LexicalErrorBoundary';
import { HeadingNode, QuoteNode } from '@lexical/rich-text';
import { ListNode, ListItemNode } from '@lexical/list';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { LinkNode } from '@lexical/link';
import { CodeNode } from '@lexical/code';
import ToolbarPlugin from './LexicalToolbar';

interface LexicalEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

// Plugin to set initial HTML content
function InitialContentPlugin({ value }: { value: string }) {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    if (value && value !== '<p><br></p>' && value !== '') {
      editor.update(() => {
        const root = $getRoot();
        root.clear();

        // Parse HTML and set content
        const parser = new DOMParser();
        const dom = parser.parseFromString(value, 'text/html');
        const nodes = $generateNodesFromDOM(editor, dom);
        if (nodes.length > 0) {
          root.append(...nodes);
        } else {
          // Fallback if HTML parsing fails
          const paragraph = $createParagraphNode();
          paragraph.append($createTextNode(dom.body.textContent || ''));
          root.append(paragraph);
        }
      });
    }
  }, [value, editor]);

  return null;
}

const editorConfig = {
  namespace: 'MyEditor',
  theme: {
    paragraph: 'mb-2',
    heading: {
      h1: 'text-3xl font-bold mb-4',
      h2: 'text-2xl font-bold mb-3',
      h3: 'text-xl font-bold mb-2',
    },
    list: {
      ul: 'list-disc ml-6 mb-2',
      ol: 'list-decimal ml-6 mb-2',
      listitem: 'mb-1',
    },
    quote: 'border-l-4 border-blue-500 pl-4 italic my-4',
    code: 'bg-gray-100 rounded px-2 py-1 font-mono text-sm',
    link: 'text-blue-600 underline hover:text-blue-800',
  },
  nodes: [
    HeadingNode,
    QuoteNode,
    ListNode,
    ListItemNode,
    LinkNode,
    CodeNode,
  ],
  onError: (error: Error) => {
    console.error(error);
  },
};

const LexicalEditor: React.FC<LexicalEditorProps> = ({ value, onChange, placeholder }) => {
  const handleChange = (editorState: any, editor: any) => {
    editor.update(() => {
      const html = $generateHtmlFromNodes(editor, null);
      onChange(html);
    });
  };

  return (
    <LexicalComposer initialConfig={editorConfig}>
      <div className="border border-gray-300 rounded-lg overflow-hidden">
        <ToolbarPlugin />
        <div className="relative">
          <RichTextPlugin
            contentEditable={
              <ContentEditable className="min-h-[200px] max-h-[400px] overflow-y-auto p-4 focus:outline-none" />
            }
            placeholder={
              <div className="absolute top-4 left-4 text-gray-400 pointer-events-none">
                {placeholder || '내용을 입력하세요...'}
              </div>
            }
            ErrorBoundary={LexicalErrorBoundary}
          />
          <OnChangePlugin onChange={handleChange} />
          <HistoryPlugin />
          <ListPlugin />
          <InitialContentPlugin value={value} />
        </div>
      </div>
    </LexicalComposer>
  );
};

export default LexicalEditor;