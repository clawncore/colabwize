import { Mark, mergeAttributes } from "@tiptap/core";
import { Plugin, PluginKey } from "@tiptap/pm/state";

export interface AuthorshipOptions {
  HTMLAttributes: Record<string, any>;
  highVisibility: boolean;
  user?: {
    id: string;
    name: string;
    color: string;
  };
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    authorship: {
      setAuthorship: (attributes: {
        authorId: string;
        authorName: string;
        color: string;
      }) => ReturnType;
      unsetAuthorship: () => ReturnType;
      toggleAuthorshipVisibility: () => ReturnType;
    };
  }
}

export const AuthorshipExtension = Mark.create<AuthorshipOptions>({
  name: "authorship",

  addOptions() {
    return {
      HTMLAttributes: {
        class: "authorship-mark",
      },
      highVisibility: false,
      user: undefined,
    };
  },

  addAttributes() {
    return {
      authorId: {
        default: null,
        parseHTML: (element) => element.getAttribute("data-author-id"),
        renderHTML: (attributes) => ({
          "data-author-id": attributes.authorId,
        }),
      },
      authorName: {
        default: null,
        parseHTML: (element) => element.getAttribute("data-author-name"),
        renderHTML: (attributes) => ({
          "data-author-name": attributes.authorName,
        }),
      },
      color: {
        default: null,
        parseHTML: (element) => element.getAttribute("data-author-color"),
        renderHTML: (attributes) => {
          const isHighVis = this.options.highVisibility;
          return {
            "data-author-color": attributes.color,
            style: isHighVis
              ? `background-color: ${attributes.color}33; border-bottom: 2px solid ${attributes.color}; border-radius: 2px; padding: 1px 0;`
              : `border-bottom: 1.5px solid ${attributes.color}44; background-color: ${attributes.color}08`,
          };
        },
      },
      timestamp: {
        default: () => new Date().toISOString(),
        parseHTML: (element) => element.getAttribute("data-timestamp"),
        renderHTML: (attributes) => ({
          "data-timestamp": attributes.timestamp,
        }),
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: "span[data-author-id]",
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "span",
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes),
      0,
    ];
  },

  addCommands() {
    return {
      setAuthorship:
        (attributes) =>
        ({ commands }) => {
          return commands.setMark(this.name, attributes);
        },
      unsetAuthorship:
        () =>
        ({ commands }) => {
          return commands.unsetMark(this.name);
        },
      toggleAuthorshipVisibility:
        () =>
        ({ editor }) => {
          this.options.highVisibility = !this.options.highVisibility;
          // Force a re-render of the editor to apply new styles
          editor.view.dispatch(editor.state.tr.setMeta("normalization", true));
          return true;
        },
    };
  },

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey("authorshipAutoTag"),
        appendTransaction: (transactions, oldState, newState) => {
          const modified = transactions.some((tr) => tr.docChanged);
          if (!modified) return null;

          // Avoid infinite loops
          const isAuthorshipLoop = transactions.some((tr) =>
            tr.getMeta("authorship"),
          );
          if (isAuthorshipLoop) return null;

          // CRITICAL: Skip transactions originating from Yjs sync (remote changes)
          // or initial collaboration synchronization to prevent re-tagging everyone's work as 'me'
          const isRemote = transactions.some(
            (tr) =>
              tr.getMeta("y-sync$") !== undefined ||
              tr.getMeta("yjs-remote") !== undefined ||
              tr.getMeta("addToHistory") === false,
          );

          if (isRemote) {
            console.log("[Authorship] Skipping remote/sync transaction");
            return null;
          }

          // Get current user from options
          const currentUser = this.options.user;
          if (!currentUser?.id) {
            console.warn("[Authorship] No user configured for tagging.");
            return null;
          }

          const { tr } = newState;
          let hasChanges = false;

          transactions.forEach((transaction) => {
            if (transaction.steps.length === 0) return;

            transaction.steps.forEach((step) => {
              step.getMap().forEach((oldStart, oldEnd, newStart, newEnd) => {
                if (newStart < newEnd) {
                  // Text was added or replaced in [newStart, newEnd]
                  tr.addMark(
                    newStart,
                    newEnd,
                    this.type.create({
                      authorId: currentUser.id,
                      authorName: currentUser.name,
                      color: currentUser.color,
                      timestamp: new Date().toISOString(),
                    }),
                  );
                  hasChanges = true;
                }
              });
            });
          });

          if (hasChanges) {
            console.log(`[Authorship] Tagged edits for ${currentUser.name}`);
            return tr.setMeta("authorship", true);
          }

          return null;
        },
      }),
    ];
  },
});
