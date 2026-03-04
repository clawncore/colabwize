# Team Git Workflow Guide (Multi-Repo)

Follow this guide to manage both **Frontend (Root)** and **Backend** repositories simultaneously.

## 1. Integrator (Project Owner)

Your job is to bring everyone's work together into the `main` branches.

- **Alt + M**: **Merge Craig's Work**
  - Checks out `main`, pulls latest, and merges `craig-update` in both repos.
- **Alt + Shift + P**: **Push to Main**
  - Pushes the local `main` branches to GitHub for both repos.

---

## 2. Collaborator (Craig)

Your job is to work in your own branch and keep it updated.

- **Alt + P**: **Push Share**
  - Saves all work and pushes to your `craig-update` branch in both repos.
- **Alt + T**: **Take Sync**
  - Pulls the absolute latest code from the team (Main) into your branches.

## The Golden Rules

1. **Pull every day.**
2. **Never push broken code.** Check for red errors before hitting `Alt + P`.
3. **Switching Folders**: The tasks use `Set-Location backend` which specifically targets the nested backend folder. Never rename this folder without updating `tasks.json`.
