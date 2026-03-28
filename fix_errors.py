import re

# 1. Fix DocumentUpload.tsx
with open("src/components/documents/DocumentUpload.tsx", "r") as f:
    content = f.read()

content = content.replace('import { zoteroService } from "../../services/zoteroService";', 'import ZoteroService from "../../services/zoteroService";')
content = content.replace('zoteroService.getLibrary()', 'ZoteroService.getLibrary()')
content = content.replace('import ZoteroIcon from "../common/ZoteroIcon";', 'import { ZoteroIcon } from "../common/ZoteroIcon";')
content = content.replace('import MendeleyIcon from "../common/MendeleyIcon";', 'import { MendeleyIcon } from "../common/MendeleyIcon";')

with open("src/components/documents/DocumentUpload.tsx", "w") as f:
    f.write(content)

# 2. Fix Profile.tsx
with open("src/components/settings/Profile.tsx", "r") as f:
    content = f.read()

content = content.replace('import {\nimport ZoteroIcon from "../common/ZoteroIcon";', 'import { ZoteroIcon } from "../common/ZoteroIcon";\nimport {')

with open("src/components/settings/Profile.tsx", "w") as f:
    f.write(content)

# 3. Fix Account.tsx
with open("src/components/settings/Account.tsx", "r") as f:
    content = f.read()

content = content.replace('import ZoteroIcon from "../common/ZoteroIcon";', 'import { ZoteroIcon } from "../common/ZoteroIcon";')

with open("src/components/settings/Account.tsx", "w") as f:
    f.write(content)

# 4. Fix EditorWorkspacePage.tsx
with open("src/components/editor/EditorWorkspacePage.tsx", "r") as f:
    content = f.read()

content = content.replace('project?.linked_library', 'selectedProject?.linked_library')

with open("src/components/editor/EditorWorkspacePage.tsx", "w") as f:
    f.write(content)

print("Fixed errors")
