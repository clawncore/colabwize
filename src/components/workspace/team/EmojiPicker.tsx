import React, { useState, useEffect } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "../../ui/popover";
import { Button } from "../../ui/button";
import { Smile, Search, X, Clock } from "lucide-react";
import { EMOJI_DATA, EmojiGroup, Emoji } from "./emoji-data";
import { cn } from "../../../lib/utils";
import { ScrollArea } from "../../ui/scroll-area";
import { Input } from "../../ui/input";

interface EmojiPickerProps {
  onSelect: (emoji: string) => void;
  className?: string;
}

export function EmojiPicker({ onSelect, className }: EmojiPickerProps) {
  const [search, setSearch] = useState("");
  const [recentEmojis, setRecentEmojis] = useState<Emoji[]>([]);
  const [activeGroup, setActiveGroup] = useState("");

  // Load recently used emojis from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("recent-emojis");
    if (saved) {
      try {
        setRecentEmojis(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse recent emojis", e);
      }
    }
  }, []);

  const handleSelect = (emojiChar: string) => {
    onSelect(emojiChar);

    // Find the full emoji object to save it with its name
    let selectedEmoji: Emoji | undefined;
    for (const group of EMOJI_DATA) {
      selectedEmoji = group.emojis.find((e) => e.char === emojiChar);
      if (selectedEmoji) break;
    }

    // Fallback if not in main data (e.g. from history itself)
    if (!selectedEmoji) {
      selectedEmoji = recentEmojis.find((e) => e.char === emojiChar);
    }

    if (selectedEmoji) {
      const updatedRecent = [
        selectedEmoji,
        ...recentEmojis.filter((e) => e.char !== emojiChar),
      ].slice(0, 16);

      setRecentEmojis(updatedRecent);
      localStorage.setItem("recent-emojis", JSON.stringify(updatedRecent));
    }
  };

  const allGroups: EmojiGroup[] = [
    ...(recentEmojis.length > 0 && !search
      ? [
          {
            group: "Recently Used",
            emojis: recentEmojis,
          },
        ]
      : []),
    ...EMOJI_DATA,
  ];

  // Set initial active group if not set
  useEffect(() => {
    if (!activeGroup && allGroups.length > 0) {
      setActiveGroup(allGroups[0].group);
    }
  }, [allGroups, activeGroup]);

  const filteredData = allGroups
    .map((group) => ({
      ...group,
      emojis: group.emojis.filter((emoji) => {
        if (!search) return true;
        return (
          emoji.name.toLowerCase().includes(search.toLowerCase()) ||
          group.group.toLowerCase().includes(search.toLowerCase())
        );
      }),
    }))
    .filter((group) => group.emojis.length > 0);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "h-10 w-10 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-full transition-all",
            className,
          )}
          title="Add emoji">
          <Smile className="h-6 w-6" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        side="top"
        align="start"
        className="w-[320px] p-0 overflow-hidden border-slate-200 shadow-2xl rounded-2xl animate-in slide-in-from-bottom-2">
        <div className="flex flex-col h-[420px] bg-white text-slate-900">
          {/* Header & Search */}
          <div className="p-3 border-b border-slate-100 bg-slate-50/50">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search categories..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 bg-white border-slate-200 h-9 text-sm focus-visible:ring-emerald-500 rounded-lg"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
          </div>

          <div className="flex flex-1 overflow-hidden">
            {/* Category Nav - Sidebar style for categorized look */}
            {!search && (
              <div className="w-12 border-r border-slate-100 bg-slate-50/30 flex flex-col items-center py-2 gap-2 overflow-y-auto hidden-scrollbar">
                {allGroups.map((group) => (
                  <button
                    key={group.group}
                    onClick={() => {
                      setActiveGroup(group.group);
                      const el = document.getElementById(
                        `emoji-group-${group.group}`,
                      );
                      el?.scrollIntoView({
                        behavior: "smooth",
                        block: "start",
                      });
                    }}
                    className={cn(
                      "p-2 rounded-lg transition-all hover:bg-white hover:shadow-sm flex items-center justify-center",
                      activeGroup === group.group
                        ? "bg-white shadow-sm text-emerald-600 scale-110"
                        : "text-slate-400",
                    )}
                    title={group.group}>
                    {group.group === "Recently Used" ? (
                      <Clock className="h-5 w-5" />
                    ) : (
                      <span className="text-lg">{group.emojis[0].char}</span>
                    )}
                  </button>
                ))}
              </div>
            )}

            {/* Emoji Grid */}
            <ScrollArea className="flex-1 p-3">
              <div className="space-y-4 pb-4">
                {filteredData.map((group) => (
                  <div key={group.group} id={`emoji-group-${group.group}`}>
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">
                      {group.group}
                    </h4>
                    <div className="grid grid-cols-8 gap-1">
                      {group.emojis.map((emoji, i) => (
                        <button
                          key={`${group.group}-${i}`}
                          onClick={() => handleSelect(emoji.char)}
                          title={emoji.name}
                          className="h-8 w-8 flex items-center justify-center text-xl rounded-md hover:bg-emerald-50 hover:scale-125 transition-all active:scale-95">
                          {emoji.char}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* Footer - Preview/Info */}
          <div className="p-2 border-t border-slate-100 bg-slate-50/50 flex justify-between items-center text-[10px] font-medium text-slate-400 uppercase tracking-tighter px-4">
            <span>Pick an emoji</span>
            <div className="flex gap-1">
              {["😀", "👍", "❤️", "✨"].map((e) => (
                <button
                  key={e}
                  onClick={() => handleSelect(e)}
                  className="hover:scale-110 transition-transform">
                  {e}
                </button>
              ))}
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
