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

// Cache font in memory to avoid re-downloading
let cachedVietnameseFont: string | null = null;

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
        if (trimmed.startsWith('|')) {
            inTable = true;

            // Check if this is a separator line (e.g., |---|---|)
            if (trimmed.match(/\|[\s-]*\|/)) {
                headerPassed = true;
                continue;
            }

            // Skip header row if we haven't passed separator yet
            // Heuristic: If row contains "Variable" or "Biến", assume it's header
            if (!headerPassed && (trimmed.toLowerCase().includes('variable') || trimmed.toLowerCase().includes('biến'))) {
                continue;
            }

            // If we hit a data row but headerPassed is still false (maybe missing separator),
            // we should be careful. But standard markdown requires separator.
            // Let's assume if it doesn't look like a separator and we haven't seen one, it might be header or data.
            // Safe bet: Require separator for valid markdown table.

            if (!headerPassed) continue;

            const cells = trimmed
                .split('|')
                .map(cell => cell.trim())
                .filter((_, i, arr) => i !== 0 && i !== arr.length - 1); // Remove first and last empty split from |...|

            // Standardize cells
            const cleanCells = cells.length > 0 ? cells : trimmed.split('|').map(c => c.trim()).filter(c => c.length > 0);

            if (cleanCells.length >= 2) {
                rows.push({
                    variable: cleanCells[0] || '',
                    code: cleanCells[1] || '',
                    items: cleanCells[2] || '',
                    source: cleanCells[3] || ''
                });
            }
        } else if (inTable) {
            // If line is empty, table might be done
            if (trimmed === '') inTable = false;
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
    let fallbackSection: OutlineSection | null = null; // For content appearing before any header

    for (const line of lines) {
        let trimmed = line.trim();

        // 1. Cleanup bold/italics wrappers like **1. Title** -> 1. Title
        trimmed = trimmed.replace(/^[\*\_]{1,3}(.*?)[\*\_]{1,3}$/, '$1').trim();

        // Detect headings (# or numbered like 1., 1.1, etc.)
        // Support: # Title, 1. Title, 1.1 Title, I. Title
        const headingMatch = trimmed.match(/^(#{1,6})\s+(.+)$/);
        const numberedMatch = trimmed.match(/^(\d+(\.\d+)*\.?)\s+(.+)$/);
        const romanMatch = trimmed.match(/^([IVX]+\.)\s+(.+)$/);

        let level = 0;
        let title = "";

        if (headingMatch) {
            level = headingMatch[1].length;
            title = headingMatch[2];
        } else if (numberedMatch) {
            level = numberedMatch[1].split('.').filter(Boolean).length; // 1.1 -> 2
            title = numberedMatch[3];
        } else if (romanMatch) {
            level = 1;
            title = romanMatch[2];
        }

        if (level > 0) {
            // Save previous section
            if (currentSection) {
                sections.push(currentSection);
            } else if (fallbackSection && fallbackSection.content.length > 0) {
                // Push fallback as a generic intro if it has content
                sections.push(fallbackSection);
                fallbackSection = null;
            }

            currentSection = {
                level: level,
                title: title.replace(/[\*\_]+/g, '').trim(), // Remove internal formatting
                content: []
            };
        } else if (trimmed.length > 0) {
            // Logic: If we have a section, add to it.
            // If not, add to fallbackSection (Intro).
            if (currentSection) {
                currentSection.content.push(trimmed);
            } else {
                if (!fallbackSection) {
                    fallbackSection = { level: 1, title: 'Introduction / Context', content: [] };
                }
                fallbackSection.content.push(trimmed);
            }
        }
    }

    // Save last section
    if (currentSection) {
        sections.push(currentSection);
    } else if (fallbackSection) {
        sections.push(fallbackSection);
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

    // 1. Load Unicode Font (Roboto Regular) - Vietnamese Support
    try {
        if (!cachedVietnameseFont) {
            const fontUrl = 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Regular.ttf';
            const fontResponse = await fetch(fontUrl);

            if (fontResponse.ok) {
                const fontBuffer = await fontResponse.arrayBuffer();
                cachedVietnameseFont = arrayBufferToBase64(fontBuffer);
            } else {
                console.warn("Failed to load Vietnamese font, fallback to default.");
            }
        }

        if (cachedVietnameseFont) {
            // Add font to VFS and register it
            doc.addFileToVFS('Roboto-Regular.ttf', cachedVietnameseFont);
            doc.addFont('Roboto-Regular.ttf', 'Roboto', 'normal');
            doc.setFont('Roboto'); // Activate font
        }
    } catch (e) {
        console.warn("Error loading font:", e);
    }

    let yPos = 20;

    // Title
    doc.setFontSize(16);
    // doc.setFont('Roboto', 'bold'); // jsPDF basic font management is tricky with styles unless added
    doc.text('DE CUONG NGHIEN CUU CHI TIET', 105, yPos, { align: 'center' }); // Keep ascii title slightly safe or use localized if font loaded
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

// Helper: Convert ArrayBuffer to Base64
function arrayBufferToBase64(buffer: ArrayBuffer): string {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++)
        binary += String.fromCharCode(bytes[i]);
    return window.btoa(binary);
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
