"use client";

import { WorkflowStep, AcademicLevel, ProjectType, AgentMessage } from './agents';
import { db } from './db';

// ============================================
// PROJECT DATA STRUCTURE
// ============================================

export interface ProjectStep {
    finalized: string;
    messages: AgentMessage[];
    mermaid?: string;
    completedAt?: string;
}

export interface SavedProject {
    id: string;
    name: string;
    createdAt: string;
    updatedAt: string;
    projectType: ProjectType;
    level: AcademicLevel;
    language: 'vi' | 'en';
    topic: string;
    goal: string;
    audience: string;
    currentStep: WorkflowStep;
    steps: {
        '1_TOPIC'?: ProjectStep;
        '2_MODEL'?: ProjectStep;
        '3_OUTLINE'?: ProjectStep;
        '4_SURVEY'?: ProjectStep;
        '5_GTM'?: ProjectStep;
    };
    status: 'in_progress' | 'completed';
    data?: {
        messages?: AgentMessage[];
        mermaid?: string;
        finalContent?: string;
        outlineContent?: string;
        outlineChart?: string;
        gtmContent?: string;
        surveyContent?: string;
        completedAt?: string;
    };
}

// ============================================
// INDEXEDDB STORAGE (NEW)
// ============================================

export async function getAllProjects(): Promise<SavedProject[]> {
    try {
        // Initial migration if needed
        if (typeof window !== 'undefined' && localStorage.getItem('haidebate_projects')) {
            await migrateFromLocalStorage();
        }
        return await db.projects.toArray();
    } catch (e) {
        console.error('Error getting projects from DB:', e);
        return [];
    }
}

export async function getProject(id: string): Promise<SavedProject | undefined> {
    try {
        return await db.projects.get(id);
    } catch (e) {
        console.error(`Error getting project ${id}:`, e);
        return undefined;
    }
}

export async function saveProject(project: SavedProject): Promise<void> {
    try {
        project.updatedAt = new Date().toISOString(); // Ensure updatedAt is always current
        await db.projects.put(project);
    } catch (e) {
        console.error('Error saving project to DB:', e);
    }
}

export async function deleteProject(id: string): Promise<void> {
    try {
        await db.projects.delete(id);
    } catch (e) {
        console.error(`Error deleting project ${id}:`, e);
    }
}

export async function renameProject(id: string, newName: string): Promise<void> {
    try {
        const project = await db.projects.get(id);
        if (project) {
            project.name = newName;
            project.updatedAt = new Date().toISOString();
            await db.projects.put(project);
        }
    } catch (e) {
        console.error(`Error renaming project ${id}:`, e);
    }
}

async function migrateFromLocalStorage() {
    try {
        const raw = localStorage.getItem('haidebate_projects');
        if (raw) {
            const projects: SavedProject[] = JSON.parse(raw);
            if (projects.length > 0) {
                console.log(`Migrating ${projects.length} projects to IndexedDB...`);
                await db.projects.bulkPut(projects);
                // Clear LS after successful migration OR keep as backup? 
                // Let's rename for safety.
                localStorage.setItem('haidebate_projects_migrated', raw);
                localStorage.removeItem('haidebate_projects');
                console.log('Migration complete.');
            }
        }
    } catch (e) {
        console.error('Migration failed:', e);
    }
}

// ============================================
// HELPERS
// ============================================

export function createNewProject(
    topic: string,
    goal: string,
    audience: string,
    level: AcademicLevel,
    language: 'vi' | 'en',
    projectType: ProjectType
): SavedProject {
    const now = new Date().toISOString();
    const id = `proj_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    return {
        id,
        name: topic.substring(0, 50) || 'Dự án mới',
        createdAt: now,
        updatedAt: now,
        projectType,
        level,
        language,
        topic,
        goal,
        audience,
        currentStep: '1_TOPIC',
        steps: {},
        status: 'in_progress'
    };
}

export function getStepLabel(step: WorkflowStep): string {
    switch (step) {
        case '1_TOPIC': return 'Đề tài';
        case '2_MODEL': return 'Mô hình';
        case '3_OUTLINE': return 'Đề cương';
        case '5_GTM': return 'GTM Strategy';
        case '4_SURVEY': return 'Bảng hỏi';
        default: return step;
    }
}

export function getProjectProgress(project: SavedProject): number {
    const isStartup = project.projectType === 'STARTUP';
    const steps = isStartup
        ? ['1_TOPIC', '2_MODEL', '3_OUTLINE', '5_GTM', '4_SURVEY'] as const
        : ['1_TOPIC', '2_MODEL', '3_OUTLINE', '4_SURVEY'] as const;

    let completed = 0;
    for (const step of steps) {
        if (project.steps[step]?.finalized) completed++;
    }
    return Math.round((completed / steps.length) * 100);
}

export function getProjectTypeLabel(type: ProjectType): string {
    return type === 'STARTUP' ? 'Khởi nghiệp' : 'Nghiên cứu';
}

export function getLevelLabel(level: AcademicLevel): string {
    switch (level) {
        case 'UNDERGRAD': return 'Đại học';
        case 'MASTER': return 'Thạc sĩ';
        case 'PHD': return 'Tiến sĩ';
        default: return level;
    }
}
