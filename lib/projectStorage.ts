"use client";

import { WorkflowStep, AcademicLevel, ProjectType, AgentMessage } from './agents';

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
    };
    status: 'in_progress' | 'completed';
}

const STORAGE_KEY = 'haidebate_projects';

// ============================================
// CRUD OPERATIONS
// ============================================

export function getAllProjects(): SavedProject[] {
    if (typeof window === 'undefined') return [];

    try {
        const data = localStorage.getItem(STORAGE_KEY);
        if (!data) return [];
        const projects = JSON.parse(data) as SavedProject[];
        // Sort by updatedAt (newest first)
        return projects.sort((a, b) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
    } catch {
        console.error('Failed to load projects from localStorage');
        return [];
    }
}

export function getProject(id: string): SavedProject | null {
    const projects = getAllProjects();
    return projects.find(p => p.id === id) || null;
}

export function saveProject(project: SavedProject): void {
    if (typeof window === 'undefined') return;

    const projects = getAllProjects();
    const existingIndex = projects.findIndex(p => p.id === project.id);

    project.updatedAt = new Date().toISOString();

    if (existingIndex >= 0) {
        projects[existingIndex] = project;
    } else {
        projects.push(project);
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
}

export function deleteProject(id: string): void {
    if (typeof window === 'undefined') return;

    const projects = getAllProjects().filter(p => p.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
}

export function renameProject(id: string, newName: string): void {
    const project = getProject(id);
    if (project) {
        project.name = newName;
        saveProject(project);
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
        case '4_SURVEY': return 'Bảng hỏi';
        default: return step;
    }
}

export function getProjectProgress(project: SavedProject): number {
    const steps = ['1_TOPIC', '2_MODEL', '3_OUTLINE', '4_SURVEY'] as const;
    let completed = 0;
    for (const step of steps) {
        if (project.steps[step]?.finalized) completed++;
    }
    return Math.round((completed / 4) * 100);
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
