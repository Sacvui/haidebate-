import {
    Document,
    Packer,
    Paragraph,
    TextRun,
    HeadingLevel,
    AlignmentType,
    Indent,
    PageBreak,
    Table,
    TableRow,
    TableCell,
    WidthType,
    BorderStyle
} from "docx";
import { saveAs } from "file-saver"; // You might need this, or just use blob approach

interface DocxData {
    topic: string;
    level: string;
    studentName?: string; // Optional
    modelContent?: string;
    outlineContent?: string;
    surveyContent?: string;
}

export const generateDocx = async (data: DocxData) => {
    // Helper for standard text paragraph (Times New Roman, 12pt, Double Spacing)
    const createParagraph = (text: string, bold = false, italic = false, alignment = AlignmentType.LEFT) => {
        return new Paragraph({
            alignment: alignment,
            spacing: {
                line: 360, // Double spacing (240 = 1.0, 360 = 1.5, 480 = 2.0 lines? No, 240 is single. 360 is 1.5. Let's check API. 
                // Rule: line rule is in 240ths of a line if 'auto'.
                // Actually, standard APA is Double Spacing.
                lineRule: "auto"
            },
            children: [
                new TextRun({
                    text: text,
                    font: "Times New Roman",
                    size: 24, // 12pt = 24 half-points
                    bold: bold,
                    italics: italic,
                }),
            ],
            indent: alignment === AlignmentType.LEFT ? { firstLine: 720 } : undefined, // 0.5 inch indent for first line
        });
    };

    // Helper for Headings
    const createHeading = (text: string, level: HeadingLevel) => {
        return new Paragraph({
            text: text,
            heading: level,
            alignment: level === HeadingLevel.HEADING_1 ? AlignmentType.CENTER : AlignmentType.LEFT,
            spacing: {
                before: 240,
                after: 120,
            },
        });
    };

    // Helper to parse Markdown-like content to Paragraphs
    // This is a simple parser. For complex markdown, we might need a better approach or just strip markdown.
    const parseContentToParagraphs = (content: string): Paragraph[] => {
        if (!content) return [];

        return content.split('\n').map(line => {
            const trimmed = line.trim();
            if (!trimmed) return new Paragraph({}); // Empty line

            // Check for Headings
            if (trimmed.startsWith('# ')) return createHeading(trimmed.substring(2), HeadingLevel.HEADING_1);
            if (trimmed.startsWith('## ')) return createHeading(trimmed.substring(3), HeadingLevel.HEADING_2);
            if (trimmed.startsWith('### ')) return createHeading(trimmed.substring(4), HeadingLevel.HEADING_3);

            // Check for list items
            if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
                return new Paragraph({
                    children: [
                        new TextRun({
                            text: trimmed.substring(2),
                            font: "Times New Roman",
                            size: 24,
                        })
                    ],
                    bullet: { level: 0 }
                });
            }

            // Standard paragraph
            return createParagraph(trimmed);
        });
    };

    const sections = [];

    // --- TITLE PAGE (APA Style) ---
    sections.push(
        new Paragraph({
            spacing: { before: 3000 }, // Push down vertically
            children: [],
        }),
        new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { line: 480 }, // Double space
            children: [
                new TextRun({
                    text: data.topic.toUpperCase(),
                    bold: true,
                    font: "Times New Roman",
                    size: 24,
                }),
            ],
        }),
        new Paragraph({ children: [] }), // Spacer
        new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { line: 480 },
            children: [
                new TextRun({
                    text: "Một đề xuất nghiên cứu được tạo bởi Hệ thống Hải Debate",
                    font: "Times New Roman",
                    size: 24,
                }),
            ],
        }),
        new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { line: 480 },
            children: [
                new TextRun({
                    text: `Trình độ: ${data.level}`,
                    font: "Times New Roman",
                    size: 24,
                }),
            ],
        }),
        new Paragraph({
            children: [new PageBreak()]
        })
    );

    // --- MAIN CONTENT ---

    // 1. Introduction / Context (from Step 1?? We assume Topic is finalized)
    // Actually we will put Model, Outline, Survey sequentially.

    // SECTION 1: CƠ SỞ LÝ THUYẾT & MÔ HÌNH
    sections.push(createHeading("Cơ sở Lý thuyết và Mô hình Nghiên cứu", HeadingLevel.HEADING_1));
    if (data.modelContent) {
        sections.push(...parseContentToParagraphs(data.modelContent));
    }
    sections.push(new Paragraph({ children: [new PageBreak()] }));

    // SECTION 2: ĐỀ CƯƠNG CHI TIẾT
    sections.push(createHeading("Đề cương Nghiên cứu Chi tiết", HeadingLevel.HEADING_1));
    if (data.outlineContent) {
        sections.push(...parseContentToParagraphs(data.outlineContent));
    }
    sections.push(new Paragraph({ children: [new PageBreak()] }));

    // SECTION 3: BẢNG HỎI KHẢO SÁT
    sections.push(createHeading("Thang đo và Bảng hỏi Khảo sát", HeadingLevel.HEADING_1));

    // Special handling for Markdown Tables in Survey Content is complex.
    // For now, we just dump text. Enhancing table parsing is a 'nice to have'.
    if (data.surveyContent) {
        // Simple heuristic: If line contains '|', render as mono-spaced or simple text for now
        // A full markdown-table-to-docx-table parser is heavy code. 
        // We will stick to text parsing but maybe switch font for tables equivalent.

        data.surveyContent.split('\n').forEach(line => {
            const trimmed = line.trim();
            if (trimmed.includes('|')) {
                sections.push(new Paragraph({
                    children: [new TextRun({ text: trimmed, font: "Courier New", size: 20 })]
                }));
            } else {
                const paras = parseContentToParagraphs(trimmed);
                sections.push(...paras);
            }
        });
    }

    const doc = new Document({
        styles: {
            paragraphStyles: [
                {
                    id: "Normal",
                    name: "Normal",
                    run: {
                        font: "Times New Roman",
                        size: 24,
                    },
                    paragraph: {
                        spacing: { line: 360 }, // 1.5 spacing readibility
                    },
                },
                {
                    id: "Heading1",
                    name: "Heading 1",
                    basedOn: "Normal",
                    next: "Normal",
                    quickFormat: true,
                    run: {
                        bold: true,
                        size: 32, // 16pt
                        font: "Times New Roman",
                    },
                    paragraph: {
                        alignment: AlignmentType.CENTER,
                        spacing: { before: 240, after: 120 },
                    },
                },
            ],
        },
        sections: [
            {
                properties: {},
                children: sections,
            },
        ],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, `Research_Proposal_${new Date().toISOString().split('T')[0]}.docx`);
};
