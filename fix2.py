import re

file_path = r'd:\SE_Project\ncskt\haidebate-\lib\agents\researchPrompts.ts'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace \\` with \`
content = content.replace("\\\\`", "\\`")

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Fixed researchPrompts.ts again")
