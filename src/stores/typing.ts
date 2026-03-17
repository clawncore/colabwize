import { create } from "zustand";

interface TypingUser {
  userId: string;
  userName: string;
  timestamp: number;
}

interface TypingState {
  // Keyed by workspaceId or channelId
  typingUsers: Record<string, TypingUser[]>;
  setTyping: (workspaceId: string, user: TypingUser) => void;
  removeTyping: (workspaceId: string, userId: string) => void;
  clearStale: (workspaceId: string) => void;
}

export const useTypingStore = create<TypingState>((set) => ({
  typingUsers: {},
  setTyping: (workspaceId, user) =>
    set((state) => {
      const current = state.typingUsers[workspaceId] || [];
      const filtered = current.filter((u) => u.userId !== user.userId);
      return {
        typingUsers: {
          ...state.typingUsers,
          [workspaceId]: [...filtered, user],
        },
      };
    }),
  removeTyping: (workspaceId, userId) =>
    set((state) => {
      const current = state.typingUsers[workspaceId] || [];
      return {
        typingUsers: {
          ...state.typingUsers,
          [workspaceId]: current.filter((u) => u.userId !== userId),
        },
      };
    }),
  clearStale: (workspaceId) =>
    set((state) => {
      const current = state.typingUsers[workspaceId] || [];
      const now = Date.now();
      const fresh = current.filter((u) => now - u.timestamp < 4000); // 4 seconds TTL
      
      if (fresh.length === current.length) return state;

      return {
        typingUsers: {
          ...state.typingUsers,
          [workspaceId]: fresh,
        },
      };
    }),
}));
