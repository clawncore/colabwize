import React from 'react';
import { useWorkspacePresence } from '../../../hooks/useWorkspacePresence';
import { Avatar, AvatarFallback, AvatarImage } from '../../ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../../ui/tooltip';

interface OnlineMembersProps {
    workspaceId: string;
}

export function OnlineMembers({ workspaceId }: OnlineMembersProps) {
    const { activeUsers, isConnected } = useWorkspacePresence(workspaceId);

    if (activeUsers.length === 0) return null;

    return (
        <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-500">Online:</span>
            <div className="flex -space-x-2">
                {activeUsers.map((user) => (
                    <TooltipProvider key={user.user_id}>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div className="relative">
                                    <Avatar className="w-8 h-8 border-2 border-white ring-1 ring-slate-100 cursor-default">
                                        <AvatarImage src={user.payload.avatar_url} />
                                        <AvatarFallback className="bg-slate-100 text-xs text-slate-500">
                                            {user.payload.name.substring(0, 2).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></span>
                                </div>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>{user.payload.name}</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                ))}
            </div>
        </div>
    );
}
