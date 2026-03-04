# 🛠️ Team Setup: One-Click Git Workflow

This project uses a "Main Integrator" workflow to avoid code-breaking conflicts across **Frontend** and **Backend**.

## 1. For the "Main Person" (You)

You are the owner of the `main` branch.

### Keyboard Shortcuts
<<<<<<< HEAD
Use these keys to manage both repositories at once:
*   **Alt + M**: **Merge Craig's Work** (Pulls and merges `craig-update` branch in both Frontend and Backend).
*   **Alt + P**: **Push to Main** (Successfully pushes everything to the official `main` branches).
=======

Use these keys to manage both repositories at once:

- **Alt + M**: **Merge Craig's Work** (Pulls and merges `craig-update` branch in both Frontend and Backend).
- **Alt + P**: **Push to Main** (Successfully pushes everything to the official `main` branches).
>>>>>>> origin/craig-update

---

## 2. For the "Collaborator" (Craig)
<<<<<<< HEAD
Craig works on separate branches called **`craig-update`** in **both** repositories (Root and Backend).

### Craig's tasks.json
=======

Craig works on separate branches called **`craig-update`** in **both** repositories (Root and Backend).

### Craig's tasks.json

>>>>>>> origin/craig-update
Craig should replace his `.vscode/tasks.json` with this version that handles both Frontend and Backend:

```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "Push Share (Craig Only)",
      "type": "shell",
      "command": "git add .; git commit -m 'Craig: Sharing updates'; git push origin craig-update; Set-Location backend; git add .; git commit -m 'Craig: Sharing backend updates'; git push origin craig-update; Set-Location ..",
      "presentation": { "reveal": "always", "panel": "new" }
    },
    {
      "label": "Take Sync (Craig Only)",
      "type": "shell",
      "command": "git add .; git commit -m 'Syncing with Main'; git pull origin main; Set-Location backend; git add .; git commit -m 'Syncing backend with Main'; git pull origin main; Set-Location ..",
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
<<<<<<< HEAD
=======

>>>>>>> origin/craig-update
1.  **Alt + P**: Push both Frontend and Backend changes to the sub-branches.
2.  **Alt + T**: Pull the latest code from the Main branches into both his repositories.
