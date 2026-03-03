import {
    STARTUP_TOPIC_WRITER_PROMPT,
    STARTUP_TOPIC_CRITIC_PROMPT,
    STARTUP_MODEL_WRITER_PROMPT,
    STARTUP_MODEL_CRITIC_PROMPT,
    STARTUP_OUTLINE_WRITER_PROMPT,
    STARTUP_OUTLINE_CRITIC_PROMPT,
    STARTUP_GTM_WRITER_PROMPT,
    STARTUP_GTM_CRITIC_PROMPT,
    STARTUP_SURVEY_WRITER_PROMPT,
    STARTUP_SURVEY_CRITIC_PROMPT,
} from '../startupPrompts';

describe('Startup Prompts - Topic', () => {
    it('writer prompt focuses on startup ideation', () => {
        expect(STARTUP_TOPIC_WRITER_PROMPT).toContain('Startup Idea');
        expect(STARTUP_TOPIC_WRITER_PROMPT).toContain('Core Problem');
        expect(STARTUP_TOPIC_WRITER_PROMPT).toContain('Early Adopters');
    });

    it('critic prompt evaluates as VC with rubric', () => {
        expect(STARTUP_TOPIC_CRITIC_PROMPT).toContain('VC');
        expect(STARTUP_TOPIC_CRITIC_PROMPT).toContain('SCALABILITY');
        expect(STARTUP_TOPIC_CRITIC_PROMPT).toContain('MOAT');
        expect(STARTUP_TOPIC_CRITIC_PROMPT).toContain('.../10');
    });
});

describe('Startup Prompts - Model (Lean Canvas)', () => {
    it('writer prompt covers 9 Lean Canvas blocks', () => {
        expect(STARTUP_MODEL_WRITER_PROMPT).toContain('Problem');
        expect(STARTUP_MODEL_WRITER_PROMPT).toContain('Solution');
        expect(STARTUP_MODEL_WRITER_PROMPT).toContain('USP');
        expect(STARTUP_MODEL_WRITER_PROMPT).toContain('Revenue Streams');
    });

    it('critic prompt has scoring rubric', () => {
        expect(STARTUP_MODEL_CRITIC_PROMPT).toContain('Revenue');
        expect(STARTUP_MODEL_CRITIC_PROMPT).toContain('Cost');
        expect(STARTUP_MODEL_CRITIC_PROMPT).toContain('PROBLEM-SOLUTION FIT');
        expect(STARTUP_MODEL_CRITIC_PROMPT).toContain('.../10');
    });
});

describe('Startup Prompts - GTM', () => {
    it('writer prompt includes channel & launch strategy', () => {
        expect(STARTUP_GTM_WRITER_PROMPT).toContain('Channels');
        expect(STARTUP_GTM_WRITER_PROMPT).toContain('90 ngày');
        expect(STARTUP_GTM_WRITER_PROMPT).toContain('KOL');
    });

    it('critic prompt checks feasibility', () => {
        expect(STARTUP_GTM_CRITIC_PROMPT).toContain('FEASIBILITY');
        expect(STARTUP_GTM_CRITIC_PROMPT).toContain('CREATIVITY');
    });
});

describe('Startup Prompts - Pitch Deck (Outline)', () => {
    it('writer prompt covers 10+ slides', () => {
        expect(STARTUP_OUTLINE_WRITER_PROMPT).toContain('SLIDE 1');
        expect(STARTUP_OUTLINE_WRITER_PROMPT).toContain('SLIDE 10');
        expect(STARTUP_OUTLINE_WRITER_PROMPT).toContain('Unit Economics');
        expect(STARTUP_OUTLINE_WRITER_PROMPT).toContain('FINANCIAL');
    });

    it('critic prompt uses rubric scoring', () => {
        expect(STARTUP_OUTLINE_CRITIC_PROMPT).toContain('STORY');
        expect(STARTUP_OUTLINE_CRITIC_PROMPT).toContain('TRACTION');
        expect(STARTUP_OUTLINE_CRITIC_PROMPT).toContain('.../10');
    });
});

describe('Startup Prompts - Survey (Customer Discovery)', () => {
    it('writer prompt references Mom Test', () => {
        expect(STARTUP_SURVEY_WRITER_PROMPT).toContain('MOM TEST');
        expect(STARTUP_SURVEY_WRITER_PROMPT).toContain('PROBLEM VALIDATION');
        expect(STARTUP_SURVEY_WRITER_PROMPT).toContain('WILLINGNESS TO PAY');
    });

    it('critic prompt penalizes leading questions', () => {
        expect(STARTUP_SURVEY_CRITIC_PROMPT).toContain('MOM TEST COMPLIANCE');
        expect(STARTUP_SURVEY_CRITIC_PROMPT).toContain('leading question');
    });
});
