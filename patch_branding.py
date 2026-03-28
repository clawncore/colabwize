import re

def patch_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    # Add ZoteroIcon import if not present
    if "ZoteroIcon" not in content:
        # Find the last import
        last_import = content.rfind("import ")
        end_of_last_import = content.find("\n", last_import) + 1
        content = content[:end_of_last_import] + 'import ZoteroIcon from "../common/ZoteroIcon";\n' + content[end_of_last_import:]

    # Text replacements
    content = content.replace("Research Vault", "Zotero Library")
    content = content.replace("Setup Vault", "Setup Zotero")
    content = content.replace("Disconnect Vault", "Disconnect Zotero")
    
    # Replace Database icon with ZoteroIcon for the Zotero section
    # <Database className="w-5 h-5 text-gray-700" /> -> <ZoteroIcon className="w-5 h-5" />
    # <Database className="w-4 h-4 mr-2" /> -> <ZoteroIcon className="w-4 h-4 mr-2" />
    content = re.sub(r'<Database([^>]+)/>', r'<ZoteroIcon\1/>', content)

    with open(filepath, 'w') as f:
        f.write(content)

patch_file("/home/clawncore/Desktop/colabwize/src/components/settings/Account.tsx")
patch_file("/home/clawncore/Desktop/colabwize/src/components/settings/Profile.tsx")

print("Patched branding")
