# Team Git Workflow Guide

Follow this guide to avoid "Merge Conflicts" and broken code.

## 1. For the "Main" Person (Project Owner)
Your job is to bring everyone's work together into the `main` branch.

### Morning Routine:
```bash
git pull origin main
```

### When a Collaborator finishes their work:
1.  **Get their branch**: `git fetch origin`
2.  **Merge their work**:
    ```bash
    git checkout main
    git merge craig-update
    ```
3.  **Fix errors**: If Git shows conflict markers (`<<<<`), fix the code in the editor, then:
    ```bash
    git add .
    git commit -m "Merge Craig's work"
    git push origin main
    ```

---

## 2. For the "Collaborator" (Craig)
Your job is to work in your own branch and keep it updated.

### Morning Routine (Get the latest from Main):
If the "Main" person updated the project, you need those changes on **your** branch.
```bash
git checkout craig-update
git pull origin main           # This pulls the latest Main into YOUR branch
```

### Before you Push:
Always make sure your code is updated with the latest from the team.
```bash
git pull origin main
# (Fix any conflicts that appear in your editor)
git add .
git commit -m "My update"
git push origin craig-update
```

## 3. The Golden Rules
1.  **Pull every day.**
2.  **Never Push broken code.** If you see red error markers in your editor, fix them BEFORE you push.
3.  **Talk to your team.** If you are going to edit `DocumentEditor.tsx`, tell others so they don't edit it at the same time.
