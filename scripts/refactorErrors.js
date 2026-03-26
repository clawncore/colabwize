const fs = require('fs');
const path = require('path');

const directoryToSearch = path.join(__dirname, '../src');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach((file) => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else {
            if (file.endsWith('.ts') || file.endsWith('.tsx')) {
                results.push(file);
            }
        }
    });
    return results;
}

const files = walk(directoryToSearch);
let modifiedFilesCount = 0;

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let originalContent = content;
    let modified = false;

    // We don't want to refactor errorHandler.ts itself!
    if (file.includes('errorHandler.ts')) return;

    // Replacing toast.error(...)
    content = content.replace(/toast\.error\(\s*([a-zA-Z0-9_]+)\.message\s*(?:\|\|\s*(['"`][^'"`]+['"`]))?\s*\)/g, (match, errVar, fallback) => {
        modified = true;
        return fallback 
            ? `toast.error(getErrorMessage(${errVar}, ${fallback}))` 
            : `toast.error(getErrorMessage(${errVar}))`;
    });

    // Replacing description: error.message
    content = content.replace(/(description:\s*)([a-zA-Z0-9_]+)\.message\s*(?:\|\|\s*(['"`][^'"`]+['"`]))?/g, (match, prefix, errVar, fallback) => {
        modified = true;
        return fallback
            ? `${prefix}getErrorMessage(${errVar}, ${fallback})`
            : `${prefix}getErrorMessage(${errVar})`;
    });

    // Replacing message: error.message
    content = content.replace(/(message:\s*)([a-zA-Z0-9_]+)\.message\s*(?:\|\|\s*(['"`][^'"`]+['"`]))?/g, (match, prefix, errVar, fallback) => {
        // Exclude if it's already getErrorMessage
        if (match.includes('getErrorMessage')) return match;
        modified = true;
        return fallback
            ? `${prefix}getErrorMessage(${errVar}, ${fallback})`
            : `${prefix}getErrorMessage(${errVar})`;
    });

    // Replacing error: error.message (like in loggers or state)
    content = content.replace(/(error:\s*)([a-zA-Z0-9_]+)\.message\s*(?:\|\|\s*(['"`][^'"`]+['"`]))?(?![\w])/g, (match, prefix, errVar, fallback) => {
         if (match.includes('getErrorMessage')) return match;
         modified = true;
         return fallback
            ? `${prefix}getErrorMessage(${errVar}, ${fallback})`
            : `${prefix}getErrorMessage(${errVar})`;
    });

    // Replacing throw new Error(error.message)
    content = content.replace(/throw\s+new\s+Error\(\s*([a-zA-Z0-9_]+)\.message\s*(?:\|\|\s*(['"`][^'"`]+['"`]))?\s*\)/g, (match, errVar, fallback) => {
        modified = true;
        return fallback
            ? `throw new Error(getErrorMessage(${errVar}, ${fallback}))`
            : `throw new Error(getErrorMessage(${errVar}))`;
    });

    if (modified && content !== originalContent) {
        if (!content.includes('getErrorMessage')) {
            // Find relative path to utils/errorHandler
            // file is absolute path.
            const srcPath = path.join(__dirname, '../src');
            const relativeToFile = path.relative(srcPath, file);
            const depth = relativeToFile.split(path.sep).length - 1;
            
            let importPath = depth === 0 ? './utils/errorHandler' : '../'.repeat(depth) + 'utils/errorHandler';
            
            // Clean up windows seps if any
            importPath = importPath.replace(/\\/g, '/');
            
            const importStatement = `import { getErrorMessage } from "${importPath}";\n`;
            
            // Inject after last import, or at top
            const lastImportMatch = [...content.matchAll(/^import /gm)].pop();
            if (lastImportMatch) {
                const index = content.indexOf('\n', lastImportMatch.index) + 1;
                content = content.slice(0, index) + importStatement + content.slice(index);
            } else {
                 // Insert at top if no import exists
                 content = importStatement + content;
            }
        }
        
        fs.writeFileSync(file, content, 'utf8');
        modifiedFilesCount++;
        console.log(`Modified: ${file}`);
    }
});

console.log(`Done! Modified ${modifiedFilesCount} files.`);
