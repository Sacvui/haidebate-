// Outline validation utilities

import { AcademicLevel } from './agents';

export interface OutlineValidationResult {
    valid: boolean;
    errors: string[];
    warnings: string[];
    score: number;
    details: {
        hasProperNumbering: boolean;
        citationCount: number;
        wordCount: number;
        missingSections: string[];
    };
}

/**
 * Validate outline structure and content quality
 */
export function validateOutline(
    content: string,
    level: AcademicLevel
): OutlineValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    let score = 100;

    // Define required sections based on level
    const requiredSections = level === 'UNDERGRAD'
        ? ['tổng quan', 'cơ sở lý thuyết', 'phương pháp', 'kết quả']
        : ['đặt vấn đề', 'tổng quan', 'lý thuyết', 'phương pháp', 'kết quả', 'kết luận'];

    // Check for required sections
    const missingSections: string[] = [];
    requiredSections.forEach(section => {
        if (!content.toLowerCase().includes(section)) {
            missingSections.push(section);
            errors.push(`Thiếu section quan trọng: "${section}"`);
            score -= 15;
        }
    });

    // Check numbering system (should have 1., 1.1., etc.)
    const hasMainNumbering = /^\d+\.\s/m.test(content);
    const hasSubNumbering = /^\d+\.\d+\.\s/m.test(content);
    const hasProperNumbering = hasMainNumbering && hasSubNumbering;

    if (!hasProperNumbering) {
        errors.push('Hệ thống đánh số không đúng (phải dùng 1, 1.1, 1.1.1)');
        score -= 10;
    }

    // Check citations (Author, Year) format
    const citationMatches = content.match(/\([A-Z][a-z]+.*?\d{4}\)/g) || [];
    const citationCount = citationMatches.length;

    const minCitations = level === 'UNDERGRAD' ? 10 : level === 'MASTER' ? 20 : 30;

    if (citationCount < minCitations) {
        warnings.push(
            `Chỉ có ${citationCount} citations (cần ít nhất ${minCitations} cho ${level})`
        );
        score -= 10;
    }

    // Check for fake DOIs (basic check)
    const doiMatches = content.match(/10\.\d{4,9}\/[^\s]+/g) || [];
    if (doiMatches.length > 5) {
        warnings.push(
            `Phát hiện ${doiMatches.length} DOIs - Hãy verify chúng để đảm bảo không có DOI giả`
        );
    }

    // Check word count
    const wordCount = content.split(/\s+/).filter(w => w.length > 0).length;
    const minWords = level === 'UNDERGRAD' ? 2000 : level === 'MASTER' ? 4000 : 6000;
    const maxWords = level === 'UNDERGRAD' ? 5000 : level === 'MASTER' ? 8000 : 12000;

    if (wordCount < minWords) {
        warnings.push(`Chỉ có ${wordCount} từ (cần ít nhất ${minWords} từ)`);
        score -= 5;
    } else if (wordCount > maxWords) {
        warnings.push(`Có ${wordCount} từ (quá dài, nên giữ dưới ${maxWords} từ)`);
    }

    // Check for common issues
    if (content.includes('Dưới đây là') || content.includes('Tôi đã')) {
        warnings.push('Phát hiện lời dẫn nhập không cần thiết - nên xóa bỏ');
        score -= 3;
    }

    if (content.includes('```') || content.includes('###')) {
        warnings.push('Phát hiện markdown syntax - nên format lại cho chuẩn');
        score -= 3;
    }

    return {
        valid: errors.length === 0,
        errors,
        warnings,
        score: Math.max(0, Math.min(100, score)),
        details: {
            hasProperNumbering,
            citationCount,
            wordCount,
            missingSections
        }
    };
}

/**
 * Get validation summary message
 */
export function getValidationMessage(result: OutlineValidationResult): string {
    let message = `📊 ĐÁNH GIÁ ĐỀ CƯƠNG: ${result.score}/100\n\n`;

    if (result.errors.length > 0) {
        message += `❌ LỖI NGHIÊM TRỌNG (${result.errors.length}):\n`;
        result.errors.forEach((error, i) => {
            message += `${i + 1}. ${error}\n`;
        });
        message += '\n';
    }

    if (result.warnings.length > 0) {
        message += `CẢNH BÁO (${result.warnings.length}):\n`;
        result.warnings.forEach((warning, i) => {
            message += `${i + 1}. ${warning}\n`;
        });
        message += '\n';
    }

    message += `📈 CHI TIẾT:\n`;
    message += `- Số từ: ${result.details.wordCount}\n`;
    message += `- Số citations: ${result.details.citationCount}\n`;
    message += `- Đánh số đúng: ${result.details.hasProperNumbering ? 'Có' : 'Không'}\n`;

    if (result.valid) {
        message += `\nĐề cương đạt yêu cầu cơ bản!`;
    } else {
        message += `\n❌ Đề cương chưa đạt yêu cầu. Vui lòng sửa các lỗi trên.`;
    }

    return message;
}
