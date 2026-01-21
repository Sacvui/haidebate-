import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from 'docx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { AcademicLevel } from './agents';
import { generateDocx } from './docxGenerator';

// Helper: Parse markdown table to array of objects
interface SurveyRow {
    variable: string;
    code: string;
    items: string;
    source: string;
}

// Helper: Parse markdown table to a generic array of arrays
function parseGeneralTable(content: string, headers: string[]): string[][] {
    const rows: string[][] = [];
    const lines = content.split('\n');

    let inTable = false;
    let headerPassed = false;

    // Check if the table is the one we want by looking for headers
    const findTable = (line: string) => {
        const trimmed = line.trim();
        if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
            const cells = trimmed.split('|').map(c => c.trim().toLowerCase());
            return headers.every(h => cells.some(cell => cell.includes(h.toLowerCase())));
        }
        return false;
    };

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (findTable(line)) {
            inTable = true;
            // The next line should be the separator
            if (lines[i + 1]?.includes('---')) {
                i++; // skip separator
            }
            continue;
        }

        if (inTable) {
            const trimmed = line.trim();
            if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
                const cells = trimmed
                    .split('|')
                    .map(cell => cell.trim())
                    .filter((_, idx, arr) => idx > 0 && idx < arr.length - 1);
                rows.push(cells);
            } else {
                inTable = false;
            }
        }
    }

    return rows;
}

function parseSurveyTable(surveyContent: string): SurveyRow[] {
    const rows: SurveyRow[] = [];
    const lines = surveyContent.split('\n');

    let inTable = false;
    let headerPassed = false;

    for (const line of lines) {
        const trimmed = line.trim();

        // Detect table start
        if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
            inTable = true;

            // Skip header separator line (|---|---|---|---|)
            if (trimmed.includes('---')) {
                headerPassed = true;
                continue;
            }

            // Skip header row
            if (!headerPassed) {
                continue;
            }

            // Parse data rows
            const cells = trimmed
                .split('|')
                .map(cell => cell.trim())
                .filter(cell => cell.length > 0);

            if (cells.length >= 4) {
                rows.push({
                    variable: cells[0],
                    code: cells[1],
                    items: cells[2],
                    source: cells[3]
                });
            }
        } else if (inTable) {
            // End of table
            break;
        }
    }

    return rows;
}

// Helper: Parse markdown outline to structured sections
interface OutlineSection {
    level: number;
    title: string;
    content: string[];
}

function parseOutline(outlineContent: string): OutlineSection[] {
    const sections: OutlineSection[] = [];
    const lines = outlineContent.split('\n');

    let currentSection: OutlineSection | null = null;

    for (const line of lines) {
        const trimmed = line.trim();

        // Detect headings (# or numbered like 1., 1.1, etc.)
        const headingMatch = trimmed.match(/^(#{1,6})\s+(.+)$/);
        const numberedMatch = trimmed.match(/^(\d+\.(?:\d+\.)*)\s+(.+)$/);

        if (headingMatch) {
            // Save previous section
            if (currentSection) {
                sections.push(currentSection);
            }

            currentSection = {
                level: headingMatch[1].length,
                title: headingMatch[2],
                content: []
            };
        } else if (numberedMatch) {
            // Save previous section
            if (currentSection) {
                sections.push(currentSection);
            }

            const level = numberedMatch[1].split('.').length - 1;
            currentSection = {
                level: level + 1,
                title: numberedMatch[2],
                content: []
            };
        } else if (trimmed.length > 0 && currentSection) {
            // Add content to current section
            currentSection.content.push(trimmed);
        }
    }

    // Save last section
    if (currentSection) {
        sections.push(currentSection);
    }

    return sections;
}

// Export đề cương ra Word (Consolidated to use generateDocx)
export async function exportOutlineToWord(
    topic: string,
    outline: string,
    model: string,
    level: AcademicLevel,
    gtm?: string,
    survey?: string,
    outlineChart?: string,
    template?: any
): Promise<void> {
    await generateDocx({
        topic,
        level,
        modelContent: model,
        outlineContent: outline,
        gtmContent: gtm,
        surveyContent: survey,
        outlineChart: outlineChart,
        template: template
    });
}

// Export đề cương ra PDF
export async function exportOutlineToPDF(
    topic: string,
    outline: string,
    model: string,
    level: AcademicLevel
): Promise<Blob> {
    const doc = new jsPDF();

    // Note: jsPDF has limited Vietnamese font support
    // For production, you'd need to embed a Vietnamese font

    let yPos = 20;

    // Title
    doc.setFontSize(16);
    doc.text('DE CUONG NGHIEN CUU CHI TIET', 105, yPos, { align: 'center' });
    yPos += 10;

    doc.setFontSize(14);
    doc.text(topic, 105, yPos, { align: 'center', maxWidth: 180 });
    yPos += 15;

    doc.setFontSize(10);
    doc.text(`Trinh do: ${level}`, 105, yPos, { align: 'center' });
    yPos += 20;

    // Model section
    doc.setFontSize(12);
    doc.text('MO HINH NGHIEN CUU', 20, yPos);
    yPos += 7;

    doc.setFontSize(10);
    // Keep Vietnamese characters
    const modelText = model.substring(0, 500);
    const modelLines = doc.splitTextToSize(modelText, 170);
    doc.text(modelLines, 20, yPos);
    yPos += modelLines.length * 5 + 10;

    // Outline
    doc.setFontSize(12);
    doc.text('DE CUONG CHI TIET', 20, yPos);
    yPos += 7;

    doc.setFontSize(10);
    // Keep Vietnamese characters
    const outlineText = outline.substring(0, 1000);
    const outlineLines = doc.splitTextToSize(outlineText, 170);
    doc.text(outlineLines, 20, yPos);

    return doc.output('blob');
}

// Export survey ra Excel
export async function exportSurveyToExcel(
    surveyContent: string,
    topic: string
): Promise<Blob> {
    // Input validation
    if (!surveyContent || surveyContent.trim().length === 0) {
        throw new Error('Nội dung khảo sát không được để trống');
    }

    const rows = parseSurveyTable(surveyContent);

    if (rows.length === 0) {
        throw new Error('Không tìm thấy bảng khảo sát hợp lệ. Vui lòng kiểm tra định dạng.');
    }

    // Create worksheet data
    const wsData = [
        ['ĐỀ TÀI:', topic],
        [],
        ['BẢNG THANG ĐO KHẢO SÁT'],
        [],
        ['Biến (Variable)', 'Mã (Code)', 'Câu hỏi (Items)', 'Nguồn gốc (Source)'],
        ...rows.map(row => [row.variable, row.code, row.items, row.source])
    ];

    const ws = XLSX.utils.aoa_to_sheet(wsData);

    // Set column widths
    ws['!cols'] = [
        { wch: 20 },
        { wch: 10 },
        { wch: 50 },
        { wch: 20 }
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Survey');

    // Generate Excel file
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    return new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
}

// Export survey ra CSV (Microsoft Forms compatible)
export async function exportSurveyToCSV(
    surveyContent: string,
    topic: string
): Promise<Blob> {
    // Input validation
    if (!surveyContent || surveyContent.trim().length === 0) {
        throw new Error('Nội dung khảo sát không được để trống');
    }

    const rows = parseSurveyTable(surveyContent);

    if (rows.length === 0) {
        throw new Error('Không tìm thấy bảng khảo sát hợp lệ. Vui lòng kiểm tra định dạng.');
    }

    // Microsoft Forms CSV format:
    // Question,Option1,Option2,Option3,Option4,Option5

    const csvRows: string[] = [
        // Header
        'Question,Option1,Option2,Option3,Option4,Option5'
    ];

    // Add each survey item as a question with Likert scale options
    for (const row of rows) {
        const question = `${row.code}: ${row.items}`;
        const options = [
            '1 - Hoàn toàn không đồng ý',
            '2 - Không đồng ý',
            '3 - Trung lập',
            '4 - Đồng ý',
            '5 - Hoàn toàn đồng ý'
        ];

        // Escape commas and quotes in question
        const escapedQuestion = `"${question.replace(/"/g, '""')}"`;
        const escapedOptions = options.map(opt => `"${opt}"`);

        csvRows.push([escapedQuestion, ...escapedOptions].join(','));
    }

    const csvContent = csvRows.join('\n');

    // Use UTF-8 BOM for Excel compatibility
    const BOM = '\uFEFF';
    return new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
}

// Helper: Trigger download
export function downloadBlob(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

// Export financial projections to Excel
export async function exportFinancialToExcel(
    content: string,
    topic: string
): Promise<Blob> {
    if (!content) throw new Error('Nội dung không được để trống');

    // Extract Financial Table (Year, Revenue, Cost, Profit)
    const financialHeaders = ['Năm', 'Doanh thu', 'Chi phí', 'Lợi nhuận'];
    const financialRows = parseGeneralTable(content, financialHeaders);

    // Extract Unit Economics Table
    const ueHeaders = ['Metric', 'Giá trị', 'Giải thích'];
    const ueRows = parseGeneralTable(content, ueHeaders);

    const wb = XLSX.utils.book_new();

    if (financialRows.length > 0) {
        const wsData = [
            ['KẾ HOẠCH TÀI CHÍNH DỰ KIẾN (3 NĂM)'],
            ['Đề tài:', topic],
            [],
            ['Năm', 'Doanh thu', 'Chi phí', 'Lợi nhuận', 'Tăng trưởng'],
            ...financialRows
        ];
        const ws = XLSX.utils.aoa_to_sheet(wsData);
        ws['!cols'] = [{ wch: 15 }, { wch: 20 }, { wch: 20 }, { wch: 20 }, { wch: 15 }];
        XLSX.utils.book_append_sheet(wb, ws, 'Financial Projections');
    }

    if (ueRows.length > 0) {
        const wsData = [
            ['PHÂN TÍCH UNIT ECONOMICS'],
            ['Metric', 'Giá trị', 'Giải thích'],
            ...ueRows
        ];
        const ws = XLSX.utils.aoa_to_sheet(wsData);
        ws['!cols'] = [{ wch: 20 }, { wch: 20 }, { wch: 60 }];
        XLSX.utils.book_append_sheet(wb, ws, 'Unit Economics');
    }

    if (financialRows.length === 0 && ueRows.length === 0) {
        throw new Error('Không tìm thấy bảng dữ liệu tài chính hợp lệ trong nội dung.');
    }

    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    return new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
}
