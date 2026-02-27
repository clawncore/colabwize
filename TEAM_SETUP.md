# 🛠️ Team Setup: One-Click Git Workflow

To make our collaboration smooth and avoid code-breaking conflicts, please set up these shortcuts once.

### 1. Create your local config
Since `.vscode` is ignored by Git, you need to create this file manually on your machine:
*   Create a folder: `.vscode`
*   Create a file inside: `tasks.json`
*   Paste the content from the **"TASKS CONFIG"** section below.

### 2. Map your Keyboard Shortcuts
1. In Cursor/VS Code, press `Ctrl+Shift+P`.
2. Type **"Open Keyboard Shortcuts (JSON)"**.
3. Paste the content from the **"SHORTCUTS CONFIG"** section below at the BOTTOM of that file.

---

### 🟢 TASKS CONFIG (tasks.json)
```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "Push Share (Craig)",
      "type": "shell",
      "command": "git add . && git commit -m \"Craig: Sharing updates\" && git push origin craig-update",
      "presentation": { "reveal": "always", "panel": "new" }
    },
    {
      "label": "Take Sync (Both)",
      "type": "shell",
      "command": "git add . && git commit -m \"Syncing with Main\" && git pull origin main",
      "presentation": { "reveal": "always", "panel": "new" }
    }
  ]
}
```

### ⌨️ SHORTCUTS CONFIG (keybindings.json)
```json
[
  {
    "key": "ctrl+p",
    "command": "workbench.action.tasks.runTask",
    "args": "Push Share (Craig)"
  },
  {
    "key": "ctrl+t",
    "command": "workbench.action.tasks.runTask",
    "args": "Take Sync (Both)"
  }
]
```

---

### 🚀 How to use:
*   **Ctrl + P**: Push your work to me instantly.
*   **Ctrl + T**: Pull my latest "Clean" version into your code.
