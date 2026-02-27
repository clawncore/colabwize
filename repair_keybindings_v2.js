const fs = require("fs");
const path = require("path");

const keybindingsPath = path.join(
  process.env.APPDATA,
  "Cursor",
  "User",
  "keybindings.json",
);

const finalBindings = [
  {
    key: "ctrl+i",
    command: "composerMode.agent",
  },
  {
    key: "alt+p",
    command: "workbench.action.tasks.runTask",
    args: "Push Share (Craig)",
  },
  {
    key: "alt+s",
    command: "workbench.action.tasks.runTask",
    args: "Take Sync (Both)",
  },
  {
    key: "alt+m",
    command: "workbench.action.tasks.runTask",
    args: "Sum All Work (Merge Craig)",
  },
];

// Alternative syntax if the simple string doesn't work
const robustBindings = [
  {
    key: "ctrl+i",
    command: "composerMode.agent",
  },
  {
    key: "alt+p",
    command: "workbench.action.tasks.runTask",
    args: { task: "Push Share (Craig)" },
  },
  {
    key: "alt+s",
    command: "workbench.action.tasks.runTask",
    args: { task: "Take Sync (Both)" },
  },
  {
    key: "alt+m",
    command: "workbench.action.tasks.runTask",
    args: { task: "Sum All Work (Merge Craig)" },
  },
];

try {
  // We'll use the robust syntax (object args) as it's more definitive in newer versions
  fs.writeFileSync(
    keybindingsPath,
    JSON.stringify(robustBindings, null, 4),
    "utf8",
  );
  console.log("Successfully updated keybindings.json with robust syntax");
} catch (err) {
  console.error("Error writing keybindings.json:", err.message);
  process.exit(1);
}
