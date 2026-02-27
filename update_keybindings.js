const fs = require("fs");
const path = require("path");

const keybindingsPath = path.join(
  process.env.APPDATA,
  "Cursor",
  "User",
  "keybindings.json",
);

try {
  let content = fs.readFileSync(keybindingsPath, "utf8");
  // Remove comments if they exist for parsing
  let jsonContent = content.replace(/\/\/.*/g, "");
  let bindings = JSON.parse(jsonContent || "[]");

  const newBindings = [
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

  // Check if they already exist to avoid duplicates
  newBindings.forEach((nb) => {
    if (!bindings.find((b) => b.key === nb.key && b.command === nb.command)) {
      bindings.push(nb);
    }
  });

  fs.writeFileSync(keybindingsPath, JSON.stringify(bindings, null, 4), "utf8");
  console.log("Successfully updated keybindings.json");
} catch (err) {
  console.error("Error updating keybindings.json:", err.message);
  process.exit(1);
}
