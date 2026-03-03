import { getModelRequirements, getOutlineStructure, getCriticPersona } from '../helpers';

describe('getModelRequirements', () => {
    it('returns undergraduate requirements for UNDERGRAD', () => {
        const result = getModelRequirements('UNDERGRAD');
        expect(result).toContain('CẤP ĐỘ 1');
        expect(result).toContain('2 - 4 biến');
        expect(result).toContain('Tuyến tính đơn giản');
    });

    it('returns master requirements for MASTER', () => {
        const result = getModelRequirements('MASTER');
        expect(result).toContain('CẤP ĐỘ 2');
        expect(result).toContain('5 - 8 biến');
        expect(result).toContain('Mediator');
    });

    it('returns PhD requirements for PHD', () => {
        const result = getModelRequirements('PHD');
        expect(result).toContain('CẤP ĐỘ 3');
        expect(result).toContain('8 - 15 biến');
        expect(result).toContain('Đa tầng');
    });

    it('returns empty string for unknown level', () => {
        const result = getModelRequirements('UNKNOWN' as any);
        expect(result).toBe('');
    });
});

describe('getCriticPersona', () => {
    it('returns strict instructor for UNDERGRAD', () => {
        const result = getCriticPersona('UNDERGRAD');
        expect(result).toContain('Strict Instructor');
    });

    it('returns critical council for MASTER', () => {
        const result = getCriticPersona('MASTER');
        expect(result).toContain('Critical Council');
    });

    it('returns Reviewer 2 for PHD', () => {
        const result = getCriticPersona('PHD');
        expect(result).toContain('Reviewer 2');
        expect(result).toContain('Novelty');
    });

    it('returns default for unknown level', () => {
        const result = getCriticPersona('UNKNOWN' as any);
        expect(result).toBe('Nhà phản biện');
    });
});

describe('getOutlineStructure', () => {
    it('returns tiểu luận structure for UNDERGRAD_RESEARCH', () => {
        const result = getOutlineStructure('Tiểu luận Đại học/Khóa luận');
        expect(result).toContain('TIỂU LUẬN');
        expect(result).toContain('Mở đầu');
    });

    it('returns luận văn structure for MASTER_THESIS', () => {
        const result = getOutlineStructure('Luận văn Thạc sĩ');
        expect(result).toContain('LUẬN VĂN');
        expect(result).toContain('Chương 1');
        expect(result).toContain('Chương 5');
    });

    it('returns IMRAD structure for DOMESTIC_PAPER', () => {
        const result = getOutlineStructure('Nghiên cứu khoa học/Đăng báo trong nước');
        expect(result).toContain('IMRAD');
        expect(result).toContain('Introduction');
    });

    it('returns grant proposal structure for GRANT_PROPOSAL', () => {
        const result = getOutlineStructure('Đề xuất dự án (Grant Proposal)');
        expect(result).toContain('GRANT PROPOSAL');
        expect(result).toContain('Executive Summary');
    });

    it('returns default IMRAD for unknown type', () => {
        const result = getOutlineStructure('unknown');
        expect(result).toContain('IMRAD');
    });
});
