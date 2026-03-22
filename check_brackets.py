import sys
from typing import List, Tuple, cast

def main():
    path = r'c:\Users\SIMBY\Desktop\colabwize\src\components\admin\email\AdminEmailCenter.tsx'
    try:
        with open(path, 'r', encoding='utf-8') as f:
            content = f.read()
    except FileNotFoundError:
        print(f"Error: File not found: {path}")
        return
    
    count_mismatches(content)

def count_mismatches(text: str) -> None:
    stack: List[Tuple[str, int, int]] = []
    pairs = {'{': '}', '(': ')', '[': ']', '<': '>'}
    closers = {v: k for k, v in pairs.items()}
    
    line_no: int = 1
    char_no: int = 0
    
    for char in text:
        char_no = cast(int, char_no) + 1
        if char == '\n':
            line_no = cast(int, line_no) + 1
            char_no = 0
            
        if char in pairs:
            stack.append((char, line_no, char_no))
        elif char in closers:
            if not stack:
                print(f"Extra closer {char} at line {line_no}, col {char_no}")
                continue
            last, l, c = stack.pop()
            if last != closers[char]:
                print(f"Mismatch: {last} at {l}:{c} closed by {char} at {line_no}:{char_no}")

    while stack:
        char, l, c = stack.pop()
        print(f"Unclosed {char} at line {l}, col {c}")

if __name__ == "__main__":
    main()
