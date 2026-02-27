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

try {
  fs.writeFileSync(
    keybindingsPath,
    JSON.stringify(finalBindings, null, 4),
    "utf8",
  );
  console.log("Successfully repaired and updated keybindings.json");
} catch (err) {
  console.error("Error writing keybindings.json:", err.message);
  process.exit(1);
}
