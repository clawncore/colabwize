import re

with open("/home/clawncore/Desktop/colabwize/src/services/documentService.ts", "r") as f:
    content = f.read()

# 1. Update Project interface
content = re.sub(
    r"  workspace_id\?: string;\n\}",
    "  workspace_id?: string;\n  linked_library?: string | null;\n}",
    content
)

# 2. Update uploadDocument definition
content = re.sub(
    r"workspaceId\?: string,\n  \): Promise<UploadResponse> \{",
    "workspaceId?: string,\n    linkedLibrary?: string | null,\n  ): Promise<UploadResponse> {",
    content
)

# 3. Update uploadDocument body
content = re.sub(
    r"if \(workspaceId\) \{\n *formData\.append\(\"workspaceId\", workspaceId\);\n *\}",
    "if (workspaceId) {\n      formData.append(\"workspaceId\", workspaceId);\n    }\n    if (linkedLibrary) {\n      formData.append(\"linked_library\", linkedLibrary);\n    }",
    content
)

# 4. Update createProject definition
content = re.sub(
    r"projectId: string = \"\",\n *workspaceId\?: string,\n * \): Promise",
    "projectId: string = \"\",\n    workspaceId?: string,\n    linkedLibrary?: string | null,\n  ): Promise",
    content
)

# 5. Update createProject body
content = re.sub(
    r"workspace_id: workspaceId \|\| null,\n *\}\);",
    "workspace_id: workspaceId || null,\n        linked_library: linkedLibrary || null,\n      });",
    content
)

with open("/home/clawncore/Desktop/colabwize/src/services/documentService.ts", "w") as f:
    f.write(content)
print("Patched documentService.ts")
