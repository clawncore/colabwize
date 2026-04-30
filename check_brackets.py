
with open(r'c:\Users\SIMBY\Desktop\colabwize\src\components\admin\email\AdminEmailCenter.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

def count_mismatches(text):
    stack = []
    pairs = {'{': '}', '(': ')', '[': ']', '<': '>'}
    closers = {'}': '{', ')': '(', ']': '[', '>': '<'}
    
    for line_no, line in enumerate(text.splitlines(True), start=1):
        for char_no, char in enumerate(line, start=1):
            if char in pairs:
                # Simple heuristic for JSX tags vs generic brackets
                # If it's '<' followed by a space or '/' it's likely a tag or fragment
                stack.append((char, line_no, char_no))
            elif char in closers:
                if not stack:
                    print(f"Extra closer {char} at line {line_no}, col {char_no}")
                    continue
                last, l, c = stack.pop()
                if last != closers.get(char):
                    print(f"Mismatch: {last} at {l}:{c} closed by {char} at {line_no}:{char_no}")

    while stack:
        char, l, c = stack.pop()
        print(f"Unclosed {char} at line {l}, col {c}")

count_mismatches(content)
