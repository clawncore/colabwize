"use client";

import React from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Link from "@tiptap/extension-link";
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Link as LinkIcon,
} from "lucide-react";
import { Button } from "../../ui/button";
import "./mini-editor.css";

interface MiniEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  readOnly?: boolean;
}

const MenuBar = ({ editor }: { editor: any }) => {
  if (!editor) return null;

  const addLink = () => {
    const url = window.prompt("URL");
    if (url) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  };

  return (
    <div className="mini-editor-toolbar">
      <Button
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={editor.isActive("bold") ? "is-active" : ""}>
        <Bold className="w-4 h-4" />
      </Button>
      <Button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={editor.isActive("italic") ? "is-active" : ""}>
        <Italic className="w-4 h-4" />
      </Button>
      <div className="w-px h-4 bg-slate-200 mx-1" />
      <Button
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={editor.isActive("bulletList") ? "is-active" : ""}>
        <List className="w-4 h-4" />
      </Button>
      <Button
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={editor.isActive("orderedList") ? "is-active" : ""}>
        <ListOrdered className="w-4 h-4" />
      </Button>
      <Button
        onClick={addLink}
        className={editor.isActive("link") ? "is-active" : ""}>
        <LinkIcon className="w-4 h-4" />
      </Button>
    </div>
  );
};

export default function MiniEditor({
  value,
  onChange,
  placeholder,
  readOnly = false,
}: MiniEditorProps) {
  const extensions = React.useMemo(
    () => [
      StarterKit.configure(),
      Placeholder.configure({
        placeholder: placeholder || "Add a detailed description...",
      }),
      Link.configure({
        openOnClick: false,
      }),
    ],
    [placeholder],
  );

  const editor = useEditor({
    extensions,
    content: value,
    editable: !readOnly,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  return (
    <div className="mini-editor-container">
      {!readOnly && <MenuBar editor={editor} />}
      <EditorContent editor={editor} className="mini-editor-content" />
    </div>
  );
}
