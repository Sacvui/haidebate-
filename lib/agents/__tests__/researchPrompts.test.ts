import {
    TOPIC_WRITER_PROMPT,
    TOPIC_CRITIC_PROMPT,
    LIT_REVIEW_WRITER_PROMPT,
    LIT_REVIEW_CRITIC_PROMPT,
    OUTLINE_CRITIC_PROMPT,
    SURVEY_CRITIC_PROMPT,
    getModelWriterPrompt,
    getModelCriticPrompt,
    getOutlineWriterPrompt,
    getSurveyPrompt,
} from '../researchPrompts';

describe('Research Prompts - Topic', () => {
    it('TOPIC_WRITER_PROMPT contains few-shot examples', () => {
        expect(TOPIC_WRITER_PROMPT).toContain('VÍ DỤ MẪU');
        expect(TOPIC_WRITER_PROMPT).toContain('ĐỀ TÀI TỐT');
        expect(TOPIC_WRITER_PROMPT).toContain('ĐỀ TÀI YẾU');
    });

    it('TOPIC_CRITIC_PROMPT contains scoring rubric', () => {
        expect(TOPIC_CRITIC_PROMPT).toContain('TÍNH MỚI');
        expect(TOPIC_CRITIC_PROMPT).toContain('TÍNH KHẢ THI');
        expect(TOPIC_CRITIC_PROMPT).toContain('.../10');
    });
});

describe('Research Prompts - Literature Review', () => {
    it('LIT_REVIEW_WRITER_PROMPT requires DOI and Gap', () => {
        expect(LIT_REVIEW_WRITER_PROMPT).toContain('DOI');
        expect(LIT_REVIEW_WRITER_PROMPT).toContain('RESEARCH GAP');
    });

    it('LIT_REVIEW_CRITIC_PROMPT checks for fake citations', () => {
        expect(LIT_REVIEW_CRITIC_PROMPT).toContain('Gap nhân tạo');
    });
});

describe('Research Prompts - Model', () => {
    it('getModelWriterPrompt includes level-specific requirements', () => {
        const undergradPrompt = getModelWriterPrompt('UNDERGRAD');
        expect(typeof undergradPrompt).toBe('string');
        expect(undergradPrompt.length).toBeGreaterThan(100);
        expect(undergradPrompt).toContain('UNDERGRAD');

        const phdPrompt = getModelWriterPrompt('PHD');
        expect(phdPrompt).toContain('PHD');
        // Different levels produce different prompts
        expect(undergradPrompt).not.toEqual(phdPrompt);
    });

    it('getModelCriticPrompt includes scoring rubric', () => {
        const criticPrompt = getModelCriticPrompt('MASTER');
        expect(criticPrompt).toContain('LÝ THUYẾT');
        expect(criticPrompt).toContain('LOGIC MÔ HÌNH');
        expect(criticPrompt).toContain('.../10');
    });
});

describe('Research Prompts - Outline', () => {
    it('getOutlineWriterPrompt includes output type structure', () => {
        const prompt = getOutlineWriterPrompt('Luận văn Thạc sĩ');
        expect(prompt).toContain('PHIÊN BẢN CUỐI CÙNG');
        expect(prompt).toContain('Chương 1');
    });

    it('OUTLINE_CRITIC_PROMPT checks for Fake DOI', () => {
        expect(OUTLINE_CRITIC_PROMPT).toContain('Fake DOI');
        expect(OUTLINE_CRITIC_PROMPT).toContain('REJECT');
    });
});

describe('Research Prompts - Survey', () => {
    it('getSurveyPrompt returns methodology content', () => {
        const prompt = getSurveyPrompt('MASTER');
        expect(prompt).toContain('Methodology');
        expect(prompt).toContain('ĐỊNH LƯỢNG');
        expect(prompt).toContain('ĐỊNH TÍNH');
        expect(prompt).toContain('Mermaid');
    });

    it('SURVEY_CRITIC_PROMPT includes validity checks', () => {
        expect(SURVEY_CRITIC_PROMPT).toContain('VALIDITY');
        expect(SURVEY_CRITIC_PROMPT).toContain('RELIABILITY');
    });
});
