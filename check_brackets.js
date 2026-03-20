
const fs = require('fs');
const content = fs.readFileSync('c:\\Users\\SIMBY\\Desktop\\colabwize\\src\\components\\admin\\email\\AdminEmailCenter.tsx', 'utf8');

function checkMismatches(text) {
    const stack = [];
    const openers = ['{', '(', '[', '<'];
    const closers = ['}', ')', ']', '>'];
    const pairs = { '}': '{', ')': '(', ']': '[', '>': '<' };
    
    let lineNo = 1;
    let charNo = 0;
    
    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        charNo++;
        if (char === '\n') {
            lineNo++;
            charNo = 0;
        }
        
        // Skip comments
        if (char === '/' && text[i+1] === '/') {
            while (i < text.length && text[i] !== '\n') i++;
            lineNo++; charNo = 0;
            continue;
        }
        if (char === '/' && text[i+1] === '*') {
            while (i < text.length && !(text[i] === '*' && text[i+1] === '/')) {
                i++;
                if (text[i] === '\n') { lineNo++; charNo = 0; }
            }
            i += 2;
            continue;
        }

        if (openers.includes(char)) {
            // Heuristic to skip < if it's not a JSX tag start (e.g. math)
            // But in TSX, most < are tags.
            stack.push({ char, l: lineNo, c: charNo });
        } else if (closers.includes(char)) {
            if (stack.length === 0) {
                console.log(`Extra closer ${char} at line ${lineNo}, col ${charNo}`);
                continue;
            }
            const last = stack.pop();
            if (last.char !== pairs[char]) {
                console.log(`Mismatch: ${last.char} at ${last.l}:${last.c} closed by ${char} at ${lineNo}:${charNo}`);
            }
        }
    }
    
    while (stack.length > 0) {
        const last = stack.pop();
        console.log(`Unclosed ${last.char} at line ${last.l}, col ${last.c}`);
    }
}

checkMismatches(content);
