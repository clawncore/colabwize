import { Extension } from "@tiptap/core";

export interface AITrackingStorage {
    aiEditCount: number;
}

declare module "@tiptap/core" {
    interface Commands<ReturnType> {
        aiTracking: {
            trackAIAction: () => ReturnType;
        };
    }
}

export const AITrackingExtension = Extension.create<AITrackingStorage>({
    name: "aiTracking",

    addStorage() {
        return {
            aiEditCount: 0,
        };
    },

    addCommands() {
        return {
            trackAIAction:
                () =>
                    ({ editor }) => {
                        // Use editor.storage directly or typecast if needed,
                        // but specifically for this extension storage:
                        ((editor.storage as any).aiTracking as AITrackingStorage).aiEditCount += 1;
                        return true;
                    },
        };
    },
});
