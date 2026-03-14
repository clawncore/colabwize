import { Imessage, useMessage } from "../../../stores/messages";

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

export default function Message({ message }: { message: Imessage }) {
  const user = useUser((state) => state.user);

  return (
    <div className="flex gap-2">
      <div>
        <img
          src={message.users?.avatar_url!}
          alt={message.users?.full_name!}
          width={40}
          height={40}
          className=" rounded-full ring-2"
        />
      </div>
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <h1 className="font-bold">{message.users?.full_name}</h1>
            <h1 className="text-sm text-gray-400">
              {new Date(message.created_at).toDateString()}
            </h1>
          </div>
          {message.users?.id === user?.id && <MessageMenu message={message} />}
        </div>
        <div className="text-gray-300">
          {renderContentWithMentions(message.content)}
        </div>
      </div>
    </div>
  );
}

function renderContentWithMentions(content: string) {
  if (!content) return "";

  const mentionRegex = /@\[([^\]]+)\]\(([^)]+)\)/g;
  const matches = Array.from(content.matchAll(mentionRegex));

  if (matches.length === 0) return content;

  const parts = [];
  let lastIndex = 0;

  matches.forEach((match, i) => {
    const fullMatch = match[0];
    const name = match[1];
    // const id = match[2];
    const startIndex = match.index || 0;

    if (startIndex > lastIndex) {
      parts.push(content.substring(lastIndex, startIndex));
    }

    parts.push(
      <span
        key={`mention-${i}`}
        className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-blue-500/20 text-blue-400 text-sm font-bold border border-blue-500/30 mx-0.5"
      >
        @{name}
      </span>
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
