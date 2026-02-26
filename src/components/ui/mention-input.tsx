import React, { useState, useRef, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./avatar";
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from "./command";
import { cn } from "../../lib/utils";

export interface MentionUser {
    id: string;
    name: string;
    avatar?: string;
    email?: string;
}

interface MentionInputProps {
    value: string;
    onChange: (value: string) => void;
    users: MentionUser[];
    placeholder?: string;
    className?: string;
    disabled?: boolean;
    onEnter?: () => void;
}

export function MentionInput({
    value,
    onChange,
    users,
    placeholder = "Type @ to mention...",
    className,
    disabled,
    onEnter,
}: MentionInputProps) {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState("");
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const [cursorPosition, setCursorPosition] = useState(0);
    const [mentionStart, setMentionStart] = useState(-1);

    // Handle input change
    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newValue = e.target.value;
        const newCursorPosition = e.target.selectionStart;

        onChange(newValue);
        setCursorPosition(newCursorPosition);

        // Check for mention trigger
        const lastAtSymbol = newValue.lastIndexOf("@", newCursorPosition - 1);

        if (lastAtSymbol !== -1) {
            // Check if @ is at start or preceded by space
            const isStart = lastAtSymbol === 0;
            const isPrecededBySpace = newValue[lastAtSymbol - 1] === " " || newValue[lastAtSymbol - 1] === "\n";

            if (isStart || isPrecededBySpace) {
                // Extract potential query
                const potentialQuery = newValue.slice(lastAtSymbol + 1, newCursorPosition);

                // Check if query contains spaces (allow single space for full names, but stop if more)
                if (!potentialQuery.includes("  ")) {
                    setMentionStart(lastAtSymbol);
                    setQuery(potentialQuery);
                    setOpen(true);
                    return;
                }
            }
        }

        setOpen(false);
    };

    const handleSelectUser = (user: MentionUser) => {
        if (mentionStart === -1) return;

        const beforeMention = value.slice(0, mentionStart);
        const afterMention = value.slice(cursorPosition);

        // Markdown-style mention: @[Name](UserId)
        const mentionText = `@[${user.name}](${user.id}) `;
        const newValue = beforeMention + mentionText + afterMention;

        onChange(newValue);
        setOpen(false);
        setMentionStart(-1);

        // Restore focus and set new cursor position
        setTimeout(() => {
            if (inputRef.current) {
                inputRef.current.focus();
                const newCursorPos = mentionStart + mentionText.length;
                inputRef.current.setSelectionRange(newCursorPos, newCursorPos);
            }
        }, 0);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey && !open) {
            e.preventDefault();
            onEnter?.();
        }

        // Allow navigation in command list if open
        if (open) {
            if (e.key === "ArrowDown" || e.key === "ArrowUp" || e.key === "Enter") {
                // Let the Command component handle these
                // But we need to prevent default behavior in textarea
                if (e.key === "Enter") e.preventDefault();
            } else if (e.key === "Escape") {
                setOpen(false);
            }
        }
    };

    // Filter users based on query
    const filteredUsers = users.filter((user) =>
        user.name.toLowerCase().includes(query.toLowerCase()) ||
        (user.email && user.email.toLowerCase().includes(query.toLowerCase()))
    );

    return (
        <div className="relative w-full">
            <textarea
                ref={inputRef}
                value={value}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                disabled={disabled}
                className={cn(
                    "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none",
                    className
                )}
            />

            {open && filteredUsers.length > 0 && (
                <div className="absolute z-50 w-64 min-w-[200px] bg-popover text-popover-foreground shadow-md rounded-md border animate-in fade-in-80 zoom-in-95"
                    style={{
                        bottom: "100%",
                        left: 0,
                        marginBottom: "8px"
                    }}>
                    <Command>
                        {/* Hidden input to capture focus for keyboard nav if needed, though we manage manually */}
                        <CommandList>
                            <CommandGroup heading="Suggestions">
                                {filteredUsers.map((user) => (
                                    <CommandItem
                                        key={user.id}
                                        onSelect={() => handleSelectUser(user)}
                                        className="flex items-center gap-2 cursor-pointer"
                                    >
                                        <Avatar className="h-6 w-6">
                                            <AvatarImage src={user.avatar} />
                                            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-medium">{user.name}</span>
                                            {user.email && <span className="text-xs text-muted-foreground">{user.email}</span>}
                                        </div>
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        </CommandList>
                    </Command>
                </div>
            )}
        </div>
    );
}
