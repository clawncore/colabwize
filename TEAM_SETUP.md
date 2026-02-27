# 🛠️ Team Setup: One-Click Git Workflow

This project uses a "Main Integrator" workflow to avoid code-breaking conflicts.

## 1. For the "Main Person" (You)
You are the owner of the `main` branch. 

### Keyboard Shortcuts
Use these two keys to manage the code:
*   **Alt + M**: **Merge Craig's Work** into your machine.
*   **Alt + P**: **Push to Main** (Sends your work + his work to the server).

---

## 2. For the "Collaborator" (Craig)
Craig works on a separate branch called `craig-update`. He needs to set up these local tasks.

### Craig's tasks.json
```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "Push Share (Craig Only)",
      "type": "shell",
      "command": "git add .; git commit -m 'Craig: Sharing updates'; git push origin craig-update",
      "presentation": { "reveal": "always", "panel": "new" }
    },
    {
      "label": "Take Sync (Craig Only)",
      "type": "shell",
      "command": "git add .; git commit -m 'Syncing with Main'; git pull origin main",
      "presentation": { "reveal": "always", "panel": "new" }
    }
  ]
}
```

### Craig's Keyboard Shortcuts
```json
[
  {
    "key": "alt+p",
    "command": "workbench.action.tasks.runTask",
    "args": "Push Share (Craig Only)"
  },
  {
    "key": "alt+t",
    "command": "workbench.action.tasks.runTask",
    "args": "Take Sync (Craig Only)"
  }
]
```

### Craig's Workflow:
1.  **Alt + P**: When he wants to share his work with you.
2.  **Alt + T**: When he wants to get the latest "Clean" code from you.
