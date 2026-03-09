import { useEditor, EditorContent, Extension } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import { TextStyle } from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';
import Heading from '@tiptap/extension-heading';
import Image from '@tiptap/extension-image';
import Mathematics from '@tiptap/extension-mathematics';
import 'katex/dist/katex.min.css';

// Extension to preserve inline style attributes on all node types
const PreserveStyles = Extension.create({
  name: 'preserveStyles',
  addGlobalAttributes() {
    return [
      {
        types: [
          'heading', 'paragraph', 'bulletList', 'orderedList',
          'listItem', 'blockquote', 'codeBlock', 'hardBreak',
          'horizontalRule', 'image', 'tableRow', 'tableCell',
          'tableHeader',
        ],
        attributes: {
          style: {
            default: null,
            parseHTML: (element: HTMLElement) => element.getAttribute('style') || null,
            renderHTML: (attributes: Record<string, any>) => {
              if (!attributes.style) return {};
              return { style: attributes.style };
            },
          },
          class: {
            default: null,
            parseHTML: (element: HTMLElement) => element.getAttribute('class') || null,
            renderHTML: (attributes: Record<string, any>) => {
              if (!attributes.class) return {};
              return { class: attributes.class };
            },
          },
        },
      },
    ];
  },
});
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Bold, Italic, Underline as UnderlineIcon, Strikethrough,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  List, ListOrdered, Heading1, Heading2, Heading3,
  ImageIcon, Undo, Redo, Sigma, Highlighter, Palette,
} from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { useState, useCallback } from 'react';

interface LessonRichEditorProps {
  content: string;
  onChange: (html: string) => void;
  editable?: boolean;
}

const COLORS = [
  '#000000', '#434343', '#666666', '#999999',
  '#E03131', '#C2255C', '#9C36B5', '#6741D9',
  '#3B5BDB', '#1971C2', '#0C8599', '#099268',
  '#2F9E44', '#66A80F', '#F08C00', '#E8590C',
];

export default function LessonRichEditor({ content, onChange, editable = true }: LessonRichEditorProps) {
  const [imageUrl, setImageUrl] = useState('');
  const [latexInput, setLatexInput] = useState('');

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
      }),
      Heading.configure({ levels: [1, 2, 3] }),
      Underline,
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Image.configure({ inline: false, allowBase64: false }),
      Mathematics.configure({
        katexOptions: { throwOnError: false },
      }),
    ],
    content,
    editable,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  const addImage = useCallback(() => {
    if (imageUrl && editor) {
      editor.chain().focus().setImage({ src: imageUrl }).run();
      setImageUrl('');
    }
  }, [editor, imageUrl]);

  const insertLatex = useCallback(() => {
    if (latexInput && editor) {
      editor.chain().focus().insertContent({
        type: 'inlineMath',
        attrs: { latex: latexInput },
      }).run();
      setLatexInput('');
    }
  }, [editor, latexInput]);

  if (!editor) return null;

  if (!editable) {
    return (
      <div className="prose prose-sm dark:prose-invert max-w-none">
        <EditorContent editor={editor} />
      </div>
    );
  }

  const ToolBtn = ({ active, onClick, children, title }: { active?: boolean; onClick: () => void; children: React.ReactNode; title?: string }) => (
    <Button
      type="button"
      variant={active ? 'default' : 'ghost'}
      size="icon"
      className="h-8 w-8"
      onClick={onClick}
      title={title}
    >
      {children}
    </Button>
  );

  return (
    <div className="border rounded-lg overflow-hidden">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 p-2 bg-muted/50 border-b">
        <ToolBtn onClick={() => editor.chain().focus().undo().run()} title="Annuler">
          <Undo className="h-4 w-4" />
        </ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().redo().run()} title="Refaire">
          <Redo className="h-4 w-4" />
        </ToolBtn>

        <Separator orientation="vertical" className="h-6 mx-1" />

        <ToolBtn active={editor.isActive('heading', { level: 1 })} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} title="Titre 1">
          <Heading1 className="h-4 w-4" />
        </ToolBtn>
        <ToolBtn active={editor.isActive('heading', { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} title="Titre 2">
          <Heading2 className="h-4 w-4" />
        </ToolBtn>
        <ToolBtn active={editor.isActive('heading', { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} title="Titre 3">
          <Heading3 className="h-4 w-4" />
        </ToolBtn>

        <Separator orientation="vertical" className="h-6 mx-1" />

        <ToolBtn active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()} title="Gras">
          <Bold className="h-4 w-4" />
        </ToolBtn>
        <ToolBtn active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()} title="Italique">
          <Italic className="h-4 w-4" />
        </ToolBtn>
        <ToolBtn active={editor.isActive('underline')} onClick={() => editor.chain().focus().toggleUnderline().run()} title="Souligné">
          <UnderlineIcon className="h-4 w-4" />
        </ToolBtn>
        <ToolBtn active={editor.isActive('strike')} onClick={() => editor.chain().focus().toggleStrike().run()} title="Barré">
          <Strikethrough className="h-4 w-4" />
        </ToolBtn>

        <Separator orientation="vertical" className="h-6 mx-1" />

        {/* Color picker */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8" title="Couleur du texte">
              <Palette className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-2">
            <div className="grid grid-cols-4 gap-1">
              {COLORS.map(color => (
                <button
                  key={color}
                  className="w-6 h-6 rounded border border-border"
                  style={{ backgroundColor: color }}
                  onClick={() => editor.chain().focus().setColor(color).run()}
                />
              ))}
            </div>
          </PopoverContent>
        </Popover>

        <ToolBtn active={editor.isActive('highlight')} onClick={() => editor.chain().focus().toggleHighlight({ color: '#ffc078' }).run()} title="Surligner">
          <Highlighter className="h-4 w-4" />
        </ToolBtn>

        <Separator orientation="vertical" className="h-6 mx-1" />

        <ToolBtn active={editor.isActive({ textAlign: 'left' })} onClick={() => editor.chain().focus().setTextAlign('left').run()} title="Aligner à gauche">
          <AlignLeft className="h-4 w-4" />
        </ToolBtn>
        <ToolBtn active={editor.isActive({ textAlign: 'center' })} onClick={() => editor.chain().focus().setTextAlign('center').run()} title="Centrer">
          <AlignCenter className="h-4 w-4" />
        </ToolBtn>
        <ToolBtn active={editor.isActive({ textAlign: 'right' })} onClick={() => editor.chain().focus().setTextAlign('right').run()} title="Aligner à droite">
          <AlignRight className="h-4 w-4" />
        </ToolBtn>
        <ToolBtn active={editor.isActive({ textAlign: 'justify' })} onClick={() => editor.chain().focus().setTextAlign('justify').run()} title="Justifier">
          <AlignJustify className="h-4 w-4" />
        </ToolBtn>

        <Separator orientation="vertical" className="h-6 mx-1" />

        <ToolBtn active={editor.isActive('bulletList')} onClick={() => editor.chain().focus().toggleBulletList().run()} title="Liste à puces">
          <List className="h-4 w-4" />
        </ToolBtn>
        <ToolBtn active={editor.isActive('orderedList')} onClick={() => editor.chain().focus().toggleOrderedList().run()} title="Liste numérotée">
          <ListOrdered className="h-4 w-4" />
        </ToolBtn>

        <Separator orientation="vertical" className="h-6 mx-1" />

        {/* Image */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8" title="Insérer une image">
              <ImageIcon className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-72">
            <div className="space-y-2">
              <p className="text-sm font-medium">URL de l'image</p>
              <Input
                placeholder="https://..."
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addImage()}
              />
              <Button size="sm" className="w-full" onClick={addImage}>Insérer</Button>
            </div>
          </PopoverContent>
        </Popover>

        {/* LaTeX */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8" title="Formule mathématique (LaTeX)">
              <Sigma className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="space-y-2">
              <p className="text-sm font-medium">Formule LaTeX</p>
              <Input
                placeholder="E = mc^2"
                value={latexInput}
                onChange={(e) => setLatexInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && insertLatex()}
              />
              <p className="text-xs text-muted-foreground">Tapez $formule$ dans l'éditeur ou insérez ici.</p>
              <Button size="sm" className="w-full" onClick={insertLatex}>Insérer</Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Editor */}
      <EditorContent
        editor={editor}
        className="min-h-[400px] p-4 prose prose-sm dark:prose-invert max-w-none focus-within:outline-none [&_.ProseMirror]:outline-none [&_.ProseMirror]:min-h-[380px]"
      />
    </div>
  );
}
