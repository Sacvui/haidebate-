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

import { ExportTemplate } from '../components/ExportTemplateSelector';

interface DocxData {
    topic: string;
    level: string;
    studentName?: string;
    modelContent?: string;
    outlineContent?: string;
    outlineChart?: string;
    gtmContent?: string;
    surveyContent?: string;
    template?: ExportTemplate;
}

export const generateDocx = async (data: DocxData) => {
    const template = data.template || 'academic';

    // Theme Config
    const themes = {
        academic: {
            font: "Times New Roman",
            headingSize: 32,
            bodySize: 24,
            headingColor: "000000",
            accentColor: "000000",
            spacing: 360,
            alignment: AlignmentType.CENTER
        },
        business: {
            font: "Arial",
            headingSize: 28,
            bodySize: 22,
            headingColor: "1E3A8A", // Blue 900
            accentColor: "3B82F6", // Blue 500
            spacing: 300,
            alignment: AlignmentType.LEFT
        },
        creative: {
            font: "Calibri",
            headingSize: 36,
            bodySize: 22,
            headingColor: "DB2777", // Pink 600
            accentColor: "F472B6", // Pink 400
            spacing: 320,
            alignment: AlignmentType.LEFT
        },
        minimal: {
            font: "Segoe UI",
            headingSize: 24,
            bodySize: 20,
            headingColor: "374151", // Gray 700
            accentColor: "9CA3AF", // Gray 400
            spacing: 400,
            alignment: AlignmentType.LEFT
        }
    };

    const theme = themes[template];

    // Helper for standard text paragraph
    const createParagraph = (text: string, bold = false, italic = false, alignment = AlignmentType.LEFT) => {
        return new Paragraph({
            alignment: alignment,
            spacing: {
                line: theme.spacing,
                lineRule: "auto"
            },
            children: [
                new TextRun({
                    text: text,
                    font: theme.font,
                    size: theme.bodySize,
                    bold: bold,
                    italics: italic,
                    color: alignment === AlignmentType.LEFT ? undefined : theme.headingColor
                }),
            ],
            indent: (alignment === AlignmentType.LEFT && template === 'academic') ? { firstLine: 720 } : undefined,
        });
    };

    // Helper for Headings
    const createHeading = (text: string, level: typeof HeadingLevel[keyof typeof HeadingLevel]) => {
        const isH1 = level === HeadingLevel.HEADING_1;
        return new Paragraph({
            text: text,
            heading: level,
            alignment: isH1 ? theme.alignment : AlignmentType.LEFT,
            spacing: {
                before: isH1 ? 400 : 240,
                after: 200,
            },
        });
    };

    // Helper to render Markdown Table to docx Table
    const renderMarkdownTable = (tableContent: string): Table => {
        const lines = tableContent.trim().split('\n');
        const rows: TableRow[] = [];

        // Parse headers
        const headerCells = lines[0]
            .split('|')
            .filter(cell => cell.trim().length > 0)
            .map(cell => cell.trim());

        // Create header row
        rows.push(new TableRow({
            children: headerCells.map(text => new TableCell({
                children: [new Paragraph({
                    children: [new TextRun({ text, bold: true, font: theme.font, size: theme.bodySize - 2, color: "FFFFFF" })],
                    alignment: AlignmentType.CENTER
                })],
                shading: { fill: theme.headingColor },
                verticalAlign: "center",
            }))
        }));

        // Parse data rows
        for (let i = 2; i < lines.length; i++) {
            const cells = lines[i]
                .split('|')
                .filter(cell => cell.trim().length > 0)
                .map(cell => cell.trim());

            if (cells.length > 0) {
                rows.push(new TableRow({
                    children: cells.map(text => new TableCell({
                        children: [new Paragraph({
                            children: [new TextRun({ text, font: theme.font, size: theme.bodySize - 4 })],
                        })],
                        verticalAlign: "center",
                    }))
                }));
            }
        }

        return new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: rows,
            borders: {
                top: { style: BorderStyle.SINGLE, size: 1, color: theme.accentColor },
                bottom: { style: BorderStyle.SINGLE, size: 1, color: theme.accentColor },
                left: { style: BorderStyle.SINGLE, size: 1, color: theme.accentColor },
                right: { style: BorderStyle.SINGLE, size: 1, color: theme.accentColor },
                insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: theme.accentColor },
                insideVertical: { style: BorderStyle.SINGLE, size: 1, color: theme.accentColor },
            }
        });
    };

    // Helper to parse Markdown-like content
    const parseContentToProjectItems = (content: string): (Paragraph | Table)[] => {
        if (!content) return [];

        const items: (Paragraph | Table)[] = [];
        const lines = content.split('\n');
        let currentTableLines: string[] = [];
        let inTable = false;

        for (const line of lines) {
            const trimmed = line.trim();

            // More robust table detection: allows indentation and strictly checks for pipe at start/end or internal structure
            // Regex: Starts with optional space, then pipe, then content...
            if (trimmed.startsWith('|') || (inTable && trimmed.includes('|'))) {
                inTable = true;
                currentTableLines.push(trimmed);
                continue;
            } else if (inTable) {
                items.push(renderMarkdownTable(currentTableLines.join('\n')));
                currentTableLines = [];
                inTable = false;
                if (!trimmed) continue;
            }

            if (!trimmed) {
                items.push(new Paragraph({}));
                continue;
            }

            if (trimmed.startsWith('# ')) items.push(createHeading(trimmed.substring(2), HeadingLevel.HEADING_1));
            else if (trimmed.startsWith('## ')) items.push(createHeading(trimmed.substring(3), HeadingLevel.HEADING_2));
            else if (trimmed.startsWith('### ')) items.push(createHeading(trimmed.substring(4), HeadingLevel.HEADING_3));
            else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
                items.push(new Paragraph({
                    children: [new TextRun({ text: trimmed.substring(2), font: theme.font, size: theme.bodySize })],
                    bullet: { level: 0 }
                }));
            }
            else {
                items.push(createParagraph(trimmed));
            }
        }

        if (inTable && currentTableLines.length > 0) {
            items.push(renderMarkdownTable(currentTableLines.join('\n')));
        }

        return items;
    };

    const sections = [];

    // --- TITLE PAGE ---
    sections.push(
        new Paragraph({
            spacing: { before: 2000 },
            children: [],
        }),
        new Paragraph({
            alignment: theme.alignment,
            children: [
                new TextRun({
                    text: data.topic.toUpperCase(),
                    bold: true,
                    font: theme.font,
                    size: theme.headingSize + 4,
                    color: theme.headingColor
                }),
            ],
        }),
        new Paragraph({ spacing: { before: 400 }, children: [] }),
        new Paragraph({
            alignment: theme.alignment,
            children: [
                new TextRun({
                    text: "ĐỀ XUẤT NGHIÊN CỨU & KẾ HOẠCH PHÁT TRIỂN",
                    font: theme.font,
                    size: theme.bodySize,
                    color: theme.accentColor
                }),
            ],
        }),
        new Paragraph({
            alignment: theme.alignment,
            children: [
                new TextRun({
                    text: `Trình độ: ${data.level}`,
                    font: theme.font,
                    size: theme.bodySize,
                }),
            ],
        }),
        new Paragraph({
            alignment: theme.alignment,
            spacing: { before: 800 },
            children: [
                new TextRun({
                    text: `Ngày tạo: ${new Date().toLocaleDateString('vi-VN')}`,
                    font: theme.font,
                    size: theme.bodySize - 4,
                }),
            ],
        }),
        new Paragraph({ children: [new PageBreak()] })
    );

    // --- MAIN CONTENT ---
    sections.push(createHeading("1. Cơ sở Lý thuyết và Mô hình Nghiên cứu", HeadingLevel.HEADING_1));
    if (data.modelContent) sections.push(...parseContentToProjectItems(data.modelContent));
    sections.push(new Paragraph({ children: [new PageBreak()] }));

    sections.push(createHeading("2. Đề cương Nghiên cứu Chi tiết", HeadingLevel.HEADING_1));
    if (data.outlineContent) sections.push(...parseContentToProjectItems(data.outlineContent));

    if (data.outlineChart) {
        sections.push(new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 400, after: 400 },
            children: [
                new TextRun({ text: "[BIỂU ĐỒ MINH HỌA / ILLUSTRATION CHART]", bold: true, font: theme.font, color: theme.accentColor }),
                new TextRun({ text: "\n(Vui lòng chèn biểu đồ tại đây)", italics: true, font: theme.font, size: theme.bodySize - 4 })
            ]
        }));
    }
    sections.push(new Paragraph({ children: [new PageBreak()] }));

    if (data.gtmContent) {
        sections.push(createHeading("3. Chiến lược Ra mắt (Go-To-Market Strategy)", HeadingLevel.HEADING_1));
        sections.push(...parseContentToProjectItems(data.gtmContent));
        sections.push(new Paragraph({ children: [new PageBreak()] }));
    }

    sections.push(createHeading(`${data.gtmContent ? '4' : '3'}. Thang đo và Bảng hỏi Khảo sát`, HeadingLevel.HEADING_1));
    if (data.surveyContent) sections.push(...parseContentToProjectItems(data.surveyContent));

    const doc = new Document({
        styles: {
            paragraphStyles: [
                {
                    id: "Normal",
                    name: "Normal",
                    run: { font: theme.font, size: theme.bodySize },
                    paragraph: { spacing: { line: theme.spacing } },
                },
                {
                    id: "Heading1",
                    name: "Heading 1",
                    basedOn: "Normal",
                    next: "Normal",
                    quickFormat: true,
                    run: { bold: true, size: theme.headingSize + 2, font: theme.font, color: theme.headingColor },
                    paragraph: { alignment: theme.alignment, spacing: { before: 400, after: 200 } },
                },
                {
                    id: "Heading2",
                    name: "Heading 2",
                    basedOn: "Normal",
                    next: "Normal",
                    quickFormat: true,
                    run: { bold: true, size: theme.headingSize - 4, font: theme.font, color: theme.headingColor },
                    paragraph: { spacing: { before: 240, after: 120 } },
                },
            ],
        },
        sections: [{ properties: {}, children: sections }],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, `VietPaper_Proposal_${new Date().toISOString().split('T')[0]}.docx`);
};
