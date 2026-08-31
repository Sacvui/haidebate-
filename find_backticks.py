with open(r'd:\SE_Project\ncskt\haidebate-\lib\agents\researchPrompts.ts', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if '`' in line:
        print(f"{i+1}: {line.strip()}")
