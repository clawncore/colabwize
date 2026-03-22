import { useEffect, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import { useUser } from "../../../stores/user";
import { Imessage, useMessage } from "../../../stores/messages";
import { decryptMessage } from "../../../lib/encryption";
import { Avatar, AvatarFallback, AvatarImage } from "../../ui/avatar";

export default function Message({
  message,
  workspaceId,
  projectId,
  onAvatarClick,
  isPanel,
}: {
  message: Imessage;
  workspaceId: string;
  projectId?: string;
  onAvatarClick?: (userId: string, userData?: any) => void;
  isPanel?: boolean;
}) {
  const user = useUser((state) => state.user);
  const [decryptedContent, setDecryptedContent] = useState<string>(
    message.content.startsWith("[ENC]:") ? "Decrypting..." : message.content,
  );

  const getAvatarColor = (name: string) => {
    const colors = [
      "bg-emerald-500",
      "bg-blue-500",
      "bg-purple-500",
      "bg-orange-500",
      "bg-pink-500",
      "bg-indigo-500",
      "bg-teal-500",
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % colors.length;
    return colors[index];
  };

  const getInitial = (name: string) => {
    return name ? name.charAt(0).toUpperCase() : "?";
  };

  useEffect(() => {
    const decrypt = async () => {
      const contextId = projectId || workspaceId || "";
      if (message.content.startsWith("[ENC]:")) {
        const decrypted = await decryptMessage(message.content, contextId);
        setDecryptedContent(decrypted);
      } else {
        setDecryptedContent(message.content);
      }
    };
    decrypt();
  }, [message.content, workspaceId, projectId]);

  const isSentByMe = message.user_id === user?.id;
  const isMentioned = decryptedContent.includes(`](${user?.id})`);

  return (
    <div
      className={`flex w-full ${isSentByMe ? "justify-end" : "justify-start"} ${isPanel ? "px-0" : "px-2"}`}>
      <div
        className={`flex ${isPanel ? "max-w-[95%]" : "max-w-[80%]"} gap-2 ${isSentByMe ? "flex-row-reverse" : "flex-row"}`}>
        {!isSentByMe && (
          <div className="mt-auto mb-1 shrink-0">
            <button
              onClick={() => onAvatarClick?.(message.users?.id!, message.users)}
              className="group/avatar transition-transform hover:scale-105 active:scale-95 focus:outline-none"
              title={`View ${message.users?.full_name}'s profile`}>
              <Avatar className="h-8 w-8 ring-2 ring-emerald-50 shadow-sm cursor-pointer transition-shadow group-hover/avatar:ring-emerald-100 group-hover/avatar:shadow-md">
                <AvatarImage
                  src={message.users?.avatar_url!}
                  alt={message.users?.full_name!}
                />
                <AvatarFallback
                  className={`${getAvatarColor(message.users?.full_name || "")} text-white text-xs font-bold`}>
                  {getInitial(message.users?.full_name || "")}
                </AvatarFallback>
              </Avatar>
            </button>
          </div>
        )}
        <div className="flex flex-col gap-1">
          {!isSentByMe && (
            <span className="text-xs font-bold text-emerald-600 px-2">
              {message.users?.full_name}
            </span>
          )}
          <div
            className={`relative ${isPanel ? "px-3 py-2" : "px-4 py-2.5"} rounded-2xl shadow-sm text-sm transition-all ${
              isSentByMe
                ? isMentioned
                  ? "bg-[#E7FFB5] ring-2 ring-emerald-400/30 text-gray-800 rounded-tr-none"
                  : "bg-[#D9FDD3] text-gray-800 rounded-tr-none"
                : isMentioned
                  ? "bg-emerald-50 ring-2 ring-emerald-500/30 text-gray-800 rounded-tl-none border border-emerald-100"
                  : "bg-white text-gray-800 rounded-tl-none border border-gray-100"
            }`}>
            <div className={`pr-12 min-w-[60px] break-words ${isPanel ? "text-[13px] leading-relaxed" : ""}`}>
              {renderContentWithMentions(decryptedContent, onAvatarClick)}
            </div>
            <div className="absolute bottom-1 right-2 flex items-center gap-1">
              <span className="text-[10px] text-gray-500 leading-none">
                {new Date(message.created_at).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: false,
                })}
              </span>
              {isSentByMe && (
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  className="w-3.5 h-3.5 text-blue-500"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round">
                  <path d="M18 6L7 17l-5-5"></path>
                  <path d="M22 10l-7.5 7.5L13 16"></path>
                </svg>
              )}
            </div>
          </div>
        </div>
        {isSentByMe && (
          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
            <MessageMenu message={message} />
          </div>
        )}
      </div>
    </div>
  );
}

function renderContentWithMentions(
  content: string,
  onAvatarClick?: (userId: string) => void,
) {
  if (!content) return "";

  const mentionRegex = /@\[([^\]]+)\]\(([^)]+)\)/g;
  const matches = Array.from(content.matchAll(mentionRegex));

  if (matches.length === 0) return content;

  const parts = [];
  let lastIndex = 0;

  matches.forEach((match, i) => {
    const fullMatch = match[0];
    const name = match[1];
    const id = match[2];
    const startIndex = match.index || 0;

    if (startIndex > lastIndex) {
      parts.push(content.substring(lastIndex, startIndex));
    }

    parts.push(
      <button
        key={`mention-${i}`}
        onClick={() => onAvatarClick?.(id)}
        className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 text-sm font-bold border border-emerald-500/20 mx-0.5 hover:bg-emerald-500/20 transition-colors focus:outline-none">
        @{name}
      </button>,
    );

    lastIndex = startIndex + fullMatch.length;
  });

  if (lastIndex < content.length) {
    parts.push(content.substring(lastIndex));
  }

  return parts;
}

const MessageMenu = ({ message }: { message: Imessage }) => {
  const setActionMessage = useMessage((state) => state.setActionMessage);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <MoreHorizontal />
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>Action</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => {
            document.getElementById("trigger-edit")?.click();
            setActionMessage(message);
          }}>
          Edit
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => {
            document.getElementById("trigger-delete")?.click();
            setActionMessage(message);
          }}>
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
