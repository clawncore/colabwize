"use client";

import type { Editor } from "@tiptap/react";
import { Button } from "../ui/button";
import { Toggle } from "../ui/toggle";
import { Separator } from "../ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Input } from "../ui/input";
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Code,
  Highlighter,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  Quote,
  Minus,
  Link,
  ChevronDown,
  Undo,
  Redo,
  Type,
  Table as TableIcon,
  Trash2,
  Rows,
  Columns as ColumnsIcon,
  Combine,
  Split,
} from "lucide-react";
import { useState } from "react";

// Removed ImageUploadPopover import

interface EditorToolbarProps {
  editor: Editor | null;
}

export function EditorToolbar({ editor }: EditorToolbarProps) {
  const [linkUrl, setLinkUrl] = useState("");

  if (!editor) return null;

  const setLink = () => {
    if (linkUrl) {
      if (editor.state.selection.empty) {
        // If no text is selected, insert the URL as a link
        editor
          .chain()
          .focus()
          .insertContent(
            `<a href="${linkUrl}" target="_blank" rel="noopener noreferrer">${linkUrl}</a>`
          )
          .run();
      } else {
        // If text is selected, turn it into a link
        editor
          .chain()
          .focus()
          .extendMarkRange("link")
          .setLink({ href: linkUrl, target: "_blank" })
          .run();
      }
      setLinkUrl("");
    }
  };

  const headingLevels = [
    { level: 1, label: "Heading 1", size: "text-2xl" },
    { level: 2, label: "Heading 2", size: "text-xl" },
    { level: 3, label: "Heading 3", size: "text-lg" },
    { level: 4, label: "Heading 4", size: "text-base" },
  ] as const;

  const currentHeading = headingLevels.find((h) =>
    editor.isActive("heading", { level: h.level })
  );

  return (
    <div className="flex flex-wrap items-center gap-1 border-b border-border bg-background px-2 py-1.5">
      <Toggle
        size="sm"
        title="Undo"
        className="h-8 w-8"
        onClick={() => editor.chain().focus().undo().run()}>
        <Undo className="h-4 w-4" />
      </Toggle>
      <Toggle
        size="sm"
        title="Redo"
        className="h-8 w-8"
        onClick={() => editor.chain().focus().redo().run()}>
        <Redo className="h-4 w-4" />
      </Toggle>

      <Separator orientation="vertical" className="mx-1 h-6" />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Toggle size="sm" title="Heading" className="h-8 gap-1 px-2">
            <Type className="h-4 w-4" />
            <span className="text-xs">
              {currentHeading?.label ?? "Paragraph"}
            </span>
            <ChevronDown className="h-3 w-3" />
          </Toggle>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="bg-white">
          <DropdownMenuItem
            onClick={() => editor.chain().focus().setParagraph().run()}>
            <span className="text-sm">Paragraph</span>
          </DropdownMenuItem>
          {headingLevels.map((heading) => (
            <DropdownMenuItem
              key={heading.level}
              onClick={() =>
                editor
                  .chain()
                  .focus()
                  .toggleHeading({ level: heading.level })
                  .run()
              }>
              <span className={heading.size}>{heading.label}</span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <Separator orientation="vertical" className="mx-1 h-6" />

      <Toggle
        size="sm"
        title="Bold"
        pressed={editor.isActive("bold")}
        onPressedChange={() => editor.chain().focus().toggleBold().run()}>
        <Bold className="h-4 w-4" />
      </Toggle>
      <Toggle
        size="sm"
        title="Italic"
        pressed={editor.isActive("italic")}
        onPressedChange={() => editor.chain().focus().toggleItalic().run()}>
        <Italic className="h-4 w-4" />
      </Toggle>
      <Toggle
        size="sm"
        title="Underline"
        pressed={editor.isActive("underline")}
        onPressedChange={() => editor.chain().focus().toggleUnderline().run()}>
        <Underline className="h-4 w-4" />
      </Toggle>
      <Toggle
        size="sm"
        title="Strikethrough"
        pressed={editor.isActive("strike")}
        onPressedChange={() => editor.chain().focus().toggleStrike().run()}>
        <Strikethrough className="h-4 w-4" />
      </Toggle>
      <Toggle
        size="sm"
        title="Code"
        pressed={editor.isActive("code")}
        onPressedChange={() => editor.chain().focus().toggleCode().run()}>
        <Code className="h-4 w-4" />
      </Toggle>
      <Toggle
        size="sm"
        title="Highlight"
        pressed={editor.isActive("highlight")}
        onPressedChange={() => editor.chain().focus().toggleHighlight().run()}>
        <Highlighter className="h-4 w-4" />
      </Toggle>

      <Separator orientation="vertical" className="mx-1 h-6" />

      <Toggle
        size="sm"
        title="Align Left"
        pressed={editor.isActive({ textAlign: "left" })}
        onPressedChange={() =>
          editor.chain().focus().setTextAlign("left").run()
        }>
        <AlignLeft className="h-4 w-4" />
      </Toggle>
      <Toggle
        size="sm"
        title="Align Center"
        pressed={editor.isActive({ textAlign: "center" })}
        onPressedChange={() =>
          editor.chain().focus().setTextAlign("center").run()
        }>
        <AlignCenter className="h-4 w-4" />
      </Toggle>
      <Toggle
        size="sm"
        title="Align Right"
        pressed={editor.isActive({ textAlign: "right" })}
        onPressedChange={() =>
          editor.chain().focus().setTextAlign("right").run()
        }>
        <AlignRight className="h-4 w-4" />
      </Toggle>
      <Toggle
        size="sm"
        title="Align Justify"
        pressed={editor.isActive({ textAlign: "justify" })}
        onPressedChange={() =>
          editor.chain().focus().setTextAlign("justify").run()
        }>
        <AlignJustify className="h-4 w-4" />
      </Toggle>

      <Separator orientation="vertical" className="mx-1 h-6" />

      <Toggle
        size="sm"
        title="Bullet List"
        pressed={editor.isActive("bulletList")}
        onPressedChange={() => editor.chain().focus().toggleBulletList().run()}>
        <List className="h-4 w-4" />
      </Toggle>
      <Toggle
        size="sm"
        title="Ordered List"
        pressed={editor.isActive("orderedList")}
        onPressedChange={() =>
          editor.chain().focus().toggleOrderedList().run()
        }>
        <ListOrdered className="h-4 w-4" />
      </Toggle>

      <Separator orientation="vertical" className="mx-1 h-6" />

      <Toggle
        size="sm"
        title="Blockquote"
        pressed={editor.isActive("blockquote")}
        onPressedChange={() => editor.chain().focus().toggleBlockquote().run()}>
        <Quote className="h-4 w-4" />
      </Toggle>
      <Toggle
        size="sm"
        title="Horizontal Rule"
        className="h-8 w-8"
        onClick={() => editor.chain().focus().setHorizontalRule().run()}>
        <Minus className="h-4 w-4" />
      </Toggle>

      <Separator orientation="vertical" className="mx-1 h-6" />

      {/* Table Controls */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Toggle
            size="sm"
            title="Table"
            pressed={editor.isActive("table")}
            className="gap-1 px-2 h-8">
            <TableIcon className="h-4 w-4" />
            <ChevronDown className="h-3 w-3" />
          </Toggle>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56 bg-white">
          <DropdownMenuItem
            onClick={() =>
              editor
                .chain()
                .focus()
                .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
                .run()
            }>
            <TableIcon className="mr-2 h-4 w-4" />
            <span>Insert Table (3x3)</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => editor.chain().focus().addColumnBefore().run()}
            disabled={!editor.can().addColumnBefore()}>
            <ColumnsIcon className="mr-2 h-4 w-4" />
            <span>Add Column Before</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => editor.chain().focus().addColumnAfter().run()}
            disabled={!editor.can().addColumnAfter()}>
            <ColumnsIcon className="mr-2 h-4 w-4" />
            <span>Add Column After</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => editor.chain().focus().deleteColumn().run()}
            disabled={!editor.can().deleteColumn()}>
            <Trash2 className="mr-2 h-4 w-4" />
            <span>Delete Column</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => editor.chain().focus().addRowBefore().run()}
            disabled={!editor.can().addRowBefore()}>
            <Rows className="mr-2 h-4 w-4" />
            <span>Add Row Before</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => editor.chain().focus().addRowAfter().run()}
            disabled={!editor.can().addRowAfter()}>
            <Rows className="mr-2 h-4 w-4" />
            <span>Add Row After</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => editor.chain().focus().deleteRow().run()}
            disabled={!editor.can().deleteRow()}>
            <Trash2 className="mr-2 h-4 w-4" />
            <span>Delete Row</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => editor.chain().focus().mergeCells().run()}
            disabled={!editor.can().mergeCells()}>
            <Combine className="mr-2 h-4 w-4" />
            <span>Merge Cells</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => editor.chain().focus().splitCell().run()}
            disabled={!editor.can().splitCell()}>
            <Split className="mr-2 h-4 w-4" />
            <span>Split Cell</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => editor.chain().focus().deleteTable().run()}
            disabled={!editor.can().deleteTable()}
            className="text-red-600 focus:text-red-600">
            <Trash2 className="mr-2 h-4 w-4" />
            <span>Delete Table</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Separator orientation="vertical" className="mx-1 h-6" />

      <Popover>
        <PopoverTrigger asChild>
          <Toggle size="sm" title="Link" pressed={editor.isActive("link")}>
            <Link className="h-4 w-4" />
          </Toggle>
        </PopoverTrigger>
        <PopoverContent className="w-80 bg-white">
          <div className="flex gap-2">
            <Input
              placeholder="Enter URL..."
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && setLink()}
            />
            <Button
              size="sm"
              className="bg-blue-600 text-white hover:bg-blue-700"
              onClick={setLink}>
              Add
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
