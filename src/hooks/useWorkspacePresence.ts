import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase/client';
import useAuth from '../services/useAuth';

export interface PresenceUser {
    user_id: string;
    online_at: string;
    payload: {
        name: string;
        avatar_url?: string;
        email?: string;
    };
}

export function useWorkspacePresence(workspaceId: string) {
    const { user } = useAuth();
    const [activeUsers, setActiveUsers] = useState<PresenceUser[]>([]);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        if (!workspaceId || !user) return;

        const channel = supabase.channel(`workspace_presence:${workspaceId}`, {
            config: {
                presence: {
                    key: user.id,
                },
            },
        });

        channel
            .on('presence', { event: 'sync' }, () => {
                const newState = channel.presenceState();
                const users: PresenceUser[] = [];

                for (const id in newState) {
                    const presenceEntries = newState[id];
                    if (presenceEntries.length > 0) {
                        const entry = presenceEntries[0] as any;
                        users.push({
                            user_id: id,
                            online_at: entry.online_at,
                            payload: entry.user_info
                        });
                    }
                }
                setActiveUsers(users);
            })
            .subscribe(async (status) => {
                if (status === 'SUBSCRIBED') {
                    setIsConnected(true);
                    await channel.track({
                        online_at: new Date().toISOString(),
                        user_info: {
                            name: user.full_name || user.email?.split('@')[0] || 'Unknown',
                            avatar_url: user.avatar_url,
                            email: user.email
                        }
                    });
                }
            });

        return () => {
            supabase.removeChannel(channel);
            setIsConnected(false);
        };
    }, [workspaceId, user]);

    return { activeUsers, isConnected };
}
