"use client";

import React, { useEffect, useImperativeHandle, forwardRef } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import Image from "@tiptap/extension-image";
import { Node, mergeAttributes } from "@tiptap/core";
import { Bold, Italic, Underline as UnderlineIcon, Link as LinkIcon, Image as ImageIcon, List, ListOrdered } from "lucide-react";

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
            class: 'font-black tracking-tighter text-foreground',
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
            <a href="${url}" style="background-color: ${color}; color: white; padding: 12px 24px; text-decoration: none; border-radius: 12px; font-weight: bold; display: inline-block;">
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
    <div className="border border-border rounded-2xl bg-secondary overflow-hidden flex flex-col focus-within:border-sky-500 transition-colors w-full">
      <div className="flex flex-wrap shadow-sm items-center gap-1 p-2 border-b border-border bg-card rounded-t-2xl z-10">
        <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => editor.chain().focus().toggleBold().run()} className={`p-2 rounded-xl transition-colors ${editor.isActive("bold") ? "bg-sky-500/10 text-sky-500" : "hover:bg-secondary text-muted-foreground"}`}><Bold size={16} /></button>
        <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => editor.chain().focus().toggleItalic().run()} className={`p-2 rounded-xl transition-colors ${editor.isActive("italic") ? "bg-sky-500/10 text-sky-500" : "hover:bg-secondary text-muted-foreground"}`}><Italic size={16} /></button>
        <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => editor.chain().focus().toggleUnderline().run()} className={`p-2 rounded-xl transition-colors ${editor.isActive("underline") ? "bg-sky-500/10 text-sky-500" : "hover:bg-secondary text-muted-foreground"}`}><UnderlineIcon size={16} /></button>
        
        <div className="w-px h-6 bg-border mx-2" />
        
        <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => editor.chain().focus().toggleBulletList().run()} className={`p-2 rounded-xl transition-colors ${editor.isActive("bulletList") ? "bg-sky-500/10 text-sky-500" : "hover:bg-secondary text-muted-foreground"}`}><List size={16} /></button>
        <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => editor.chain().focus().toggleOrderedList().run()} className={`p-2 rounded-xl transition-colors ${editor.isActive("orderedList") ? "bg-sky-500/10 text-sky-500" : "hover:bg-secondary text-muted-foreground"}`}><ListOrdered size={16} /></button>
        
        <div className="w-px h-6 bg-border mx-2" />
        
        <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={addLink} className={`p-2 rounded-xl transition-colors ${editor.isActive("link") ? "bg-sky-500/10 text-sky-500" : "hover:bg-secondary text-muted-foreground"}`}><LinkIcon size={16} /></button>
        <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={addImage} className={`p-2 rounded-xl transition-colors text-muted-foreground hover:bg-secondary`}><ImageIcon size={16} /></button>
      </div>
      
      <div className="flex-1 bg-background max-h-[500px] overflow-y-auto cursor-text rounded-b-2xl">
        <EditorContent editor={editor} className="min-h-full" />
      </div>
    </div>
  );
});
EmailComposerEditor.displayName = "EmailComposerEditor";
