import re

file_path = r'd:\SE_Project\ncskt\haidebate-\lib\agents\researchPrompts.ts'
with open(file_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

new_lines = []
for i, line in enumerate(lines):
    if '`' in line:
        stripped = line.strip()
        # If it is not a pure template literal boundary
        if not (stripped.endswith('`') and len(stripped) == 1 or
                stripped.startswith('export const ') and stripped.endswith(' = `') or
                stripped.startswith('return `') or
                stripped == '`;' or
                stripped == '`'):
            
            # replace unescaped ` with \`
            # using regex: find ` that is not preceded by \
            line = re.sub(r'(?<!\\)`', r'\`', line)
            
    new_lines.append(line)

with open(file_path, 'w', encoding='utf-8') as f:
    f.writelines(new_lines)

print("Fixed all unescaped backticks")
