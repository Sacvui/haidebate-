// Barrel file - re-exports everything from the agents module
// This maintains backward compatibility with existing imports from '@/lib/agents'

export type { AgentMessage, WorkflowStep, AcademicLevel, ProjectType } from './types';
export { getModelRequirements, getOutlineStructure, getCriticPersona } from './helpers';
export {
    LIT_REVIEW_WRITER_PROMPT,
    LIT_REVIEW_CRITIC_PROMPT,
    TOPIC_WRITER_PROMPT,
    TOPIC_CRITIC_PROMPT,
    getModelWriterPrompt,
    getModelCriticPrompt,
    getOutlineWriterPrompt,
    OUTLINE_CRITIC_PROMPT,
    getSurveyPrompt,
    SURVEY_CRITIC_PROMPT,
} from './researchPrompts';
export {
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
} from './startupPrompts';
export { AgentSession } from './AgentSession';
