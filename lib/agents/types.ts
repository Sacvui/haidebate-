
export interface AgentMessage {
    role: 'writer' | 'critic';
    content: string;
    timestamp: number;
    round?: number;
}

export type WorkflowStep = '1_TOPIC' | '1_LIT_REVIEW' | '2_MODEL' | '2_ARCH' | '3_OUTLINE' | '4_SURVEY' | '4_BENCHMARK' | '5_GTM';
export type AcademicLevel = 'UNDERGRAD' | 'MASTER' | 'PHD';
export type ProjectType = 'RESEARCH' | 'STARTUP';
