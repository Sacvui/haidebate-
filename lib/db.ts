import Dexie, { Table } from 'dexie';
import { SavedProject } from './projectStorage';

export class AppDatabase extends Dexie {
    projects!: Table<SavedProject>;

    constructor() {
        super('HảiDebateDB');
        this.version(1).stores({
            projects: 'id, name, topic, createdAt, updatedAt' // Primary key and indexed fields
        });
    }
}

export const db = new AppDatabase();
