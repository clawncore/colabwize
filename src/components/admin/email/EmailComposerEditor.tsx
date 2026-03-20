"use client";

import React, { useEffect, useImperativeHandle, forwardRef } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import Image from "@tiptap/extension-image";
import { Node, mergeAttributes } from "@tiptap/core";
import { Table } from "@tiptap/extension-table";
import { TableHeader } from "@tiptap/extension-table-header";
import { TableRow } from "@tiptap/extension-table-row";
import { TableCell } from "@tiptap/extension-table-cell";
import { 
  Bold, 
  Italic, 
  Underline as UnderlineIcon, 
  Link as LinkIcon, 
  Image as ImageIcon, 
  List, 
  ListOrdered,
  Table as TableIcon
} from "lucide-react";

interface Props {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  onImageClick?: () => void;
  onLinkClick?: () => void;
}

export interface EmailComposerEditorRef {
  insertImage: (url: string) => void;
  insertLink: (text: string, url: string) => void;
  insertButton: (text: string, url: string, color?: string) => void;
}

// Custom Div extension to allow styled wrappers for buttons
const CustomDiv = Node.create({
  name: 'customDiv',
  group: 'block',
  content: 'inline*',
  parseHTML() {
    return [
      { tag: 'div' },
    ]
  },
  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes), 0]
  },
  addAttributes() {
    return {
      style: {
        default: null,
        parseHTML: element => element.getAttribute('style'),
        renderHTML: attributes => {
          if (!attributes.style) return {}
          return { style: attributes.style }
        },
      },
    }
  },
});

export const EmailComposerEditor = forwardRef<EmailComposerEditorRef, Props>(({ value, onChange, onImageClick, onLinkClick }, ref) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          HTMLAttributes: {
            class: 'font-bold tracking-tight text-slate-900',
          },
        },
      }),
      CustomDiv,
      Link.extend({
        addAttributes() {
          return {
            ...this.parent?.(),
            style: {
              default: null,
              parseHTML: element => element.getAttribute('style'),
              renderHTML: attributes => {
                if (!attributes.style) return {}
                return { style: attributes.style }
              },
            },
          }
        },
      }).configure({ 
        openOnClick: false,
        HTMLAttributes: {
          rel: 'noopener noreferrer',
          target: '_blank',
        },
      }),
      Underline,
      Image,
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: "prose prose-sm max-w-none focus:outline-none min-h-[300px] p-6 text-foreground",
      },
    },
  });

  useImperativeHandle(ref, () => ({
    insertImage: (url: string) => {
      if (editor) {
        editor.chain().focus().setImage({ src: url }).run();
      }
    },
    insertLink: (text: string, url: string) => {
      if (editor) {
        editor.chain().focus().insertContent(`<a href="${url}">${text}</a>`).run();
      }
    },
    insertButton: (text: string, url: string, color: string = "#111827") => {
      if (editor) {
        const buttonHtml = `
          <div style="margin: 25px 0; text-align: center;">
            <a href="${url}" style="background-color: ${color}; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block; font-family: sans-serif;">
              ${text}
            </a>
          </div>
        `;
        editor.chain().focus().insertContent(buttonHtml).run();
      }
    }
  }));

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value, false);
    }
  }, [value, editor]);

  if (!editor) {
    return null;
  }

  const addLink = () => {
    if (onLinkClick) {
      onLinkClick();
    } else {
      const url = window.prompt("Enter URL");
      if (url) {
        editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
      }
    }
  };

  const addImage = () => {
    if (onImageClick) {
      onImageClick();
    } else {
      const url = window.prompt("Enter Image URL (e.g. https://example.com/logo.png)");
      if (url) {
        editor.chain().focus().setImage({ src: url }).run();
      }
    }
  };

  return (
    <div className="border border-slate-200 rounded-xl bg-slate-50 overflow-hidden flex flex-col focus-within:border-sky-500 transition-colors w-full shadow-sm">
      <div className="flex flex-wrap items-center gap-1 p-2 border-b border-slate-100 bg-white rounded-t-xl z-10">
        <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => editor.chain().focus().toggleBold().run()} className={`p-2 rounded-lg transition-colors ${editor.isActive("bold") ? "bg-sky-50 text-sky-600" : "hover:bg-slate-50 text-slate-400"}`}><Bold size={16} /></button>
        <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => editor.chain().focus().toggleItalic().run()} className={`p-2 rounded-lg transition-colors ${editor.isActive("italic") ? "bg-sky-50 text-sky-600" : "hover:bg-slate-50 text-slate-400"}`}><Italic size={16} /></button>
        <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => editor.chain().focus().toggleUnderline().run()} className={`p-2 rounded-lg transition-colors ${editor.isActive("underline") ? "bg-sky-50 text-sky-600" : "hover:bg-slate-50 text-slate-400"}`}><UnderlineIcon size={16} /></button>
        
        <div className="w-px h-6 bg-slate-100 mx-2" />
        
        <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => editor.chain().focus().toggleBulletList().run()} className={`p-2 rounded-lg transition-colors ${editor.isActive("bulletList") ? "bg-sky-50 text-sky-600" : "hover:bg-slate-50 text-slate-400"}`}><List size={16} /></button>
        <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => editor.chain().focus().toggleOrderedList().run()} className={`p-2 rounded-lg transition-colors ${editor.isActive("orderedList") ? "bg-sky-50 text-sky-600" : "hover:bg-slate-50 text-slate-400"}`}><ListOrdered size={16} /></button>
        
        <div className="w-px h-6 bg-slate-100 mx-2" />
        
        <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={addLink} className={`p-2 rounded-lg transition-colors ${editor.isActive("link") ? "bg-sky-50 text-sky-600" : "hover:bg-slate-50 text-slate-400"}`}><LinkIcon size={16} /></button>
        <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={addImage} className={`p-2 rounded-lg transition-colors text-slate-400 hover:bg-slate-50`}><ImageIcon size={16} /></button>
        
        <div className="w-px h-6 bg-slate-100 mx-2" />
        
        <button 
          type="button" 
          onMouseDown={(e) => e.preventDefault()} 
          onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()} 
          className="p-2 rounded-lg transition-colors text-slate-400 hover:bg-slate-50 hover:text-sky-600"
          title="Insert Table"
        >
          <TableIcon size={16} />
        </button>

        {editor.isActive('table') && (
          <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-lg border border-slate-200 ml-2 animate-in fade-in zoom-in duration-200">
            <button type="button" onClick={() => editor.chain().focus().addColumnAfter().run()} className="px-2 py-1 text-[9px] font-bold uppercase text-slate-500 hover:text-sky-600 transition-colors" title="Add Column After">Col+</button>
            <button type="button" onClick={() => editor.chain().focus().addRowAfter().run()} className="px-2 py-1 text-[9px] font-bold uppercase text-slate-500 hover:text-sky-600 transition-colors" title="Add Row After">Row+</button>
            <div className="w-px h-3 bg-slate-200 mx-1" />
            <button type="button" onClick={() => editor.chain().focus().deleteTable().run()} className="px-2 py-1 text-[9px] font-bold uppercase text-red-400 hover:text-red-600 transition-colors" title="Delete Table">Delete</button>
          </div>
        )}
      </div>
      
      <div className="flex-1 bg-white max-h-[500px] overflow-y-auto cursor-text rounded-b-xl relative">
        <style dangerouslySetInnerHTML={{ __html: `
          .EmailComposerEditor-styles .ProseMirror table {
            border-collapse: collapse;
            table-layout: fixed;
            width: 100%;
            margin: 0;
            overflow: hidden;
            border: 1px solid #e2e8f0;
          }
          .EmailComposerEditor-styles .ProseMirror table td,
          .EmailComposerEditor-styles .ProseMirror table th {
            min-width: 1em;
            border: 1px solid #e2e8f0;
            padding: 8px 12px;
            vertical-align: top;
            box-sizing: border-box;
            position: relative;
          }
          .EmailComposerEditor-styles .ProseMirror table th {
            font-weight: bold;
            text-align: left;
            background-color: #f8fafc;
          }
          .EmailComposerEditor-styles .ProseMirror table .selectedCell:after {
            z-index: 2;
            content: "";
            position: absolute;
            left: 0; right: 0; top: 0; bottom: 0;
            background: rgba(14, 165, 233, 0.1);
            pointer-events: none;
          }
          .EmailComposerEditor-styles .ProseMirror table .column-resize-handle {
            position: absolute;
            right: -2px;
            top: 0;
            bottom: -2px;
            width: 4px;
            background-color: #0ea5e9;
            pointer-events: none;
          }
        `}} />
        <div className="EmailComposerEditor-styles min-h-full">
          <EditorContent editor={editor} className="min-h-full" />
        </div>
      </div>
    </div>
  );
});
EmailComposerEditor.displayName = "EmailComposerEditor";
