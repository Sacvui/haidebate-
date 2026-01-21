import { kv as vercelKv } from '@vercel/kv';
import Redis from 'ioredis';
import { hash } from 'bcryptjs';
import { WorkflowStep } from './agents';

// Adapter to handle both Vercel KV (HTTP) and Standard Redis (TCP)
class KVAdapter {
    private redis: Redis | null = null;
    private useVercelKV: boolean = false;

    constructor() {
        if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
            this.useVercelKV = true;
        } else if (process.env.REDIS_URL) {
            this.redis = new Redis(process.env.REDIS_URL);
        } else {
            console.warn("KV/Redis not configured");
        }
    }

    async get<T>(key: string): Promise<T | null> {
        if (this.useVercelKV) return vercelKv.get<T>(key);
        if (this.redis) {
            const val = await this.redis.get(key);
            return val ? JSON.parse(val) : null;
        }
        return null;
    }

    async set(key: string, value: any): Promise<void> {
        if (this.useVercelKV) {
            await vercelKv.set(key, value);
        } else if (this.redis) {
            await this.redis.set(key, JSON.stringify(value));
        }
    }

    async incr(key: string): Promise<number> {
        if (this.useVercelKV) return vercelKv.incr(key);
        if (this.redis) return this.redis.incr(key);
        return 0;
    }

    async sadd(key: string, value: any): Promise<number> {
        if (this.useVercelKV) return vercelKv.sadd(key, value);
        if (this.redis) return this.redis.sadd(key, value);
        return 0;
    }

    async lpush(key: string, value: any): Promise<number> {
        if (this.useVercelKV) return vercelKv.lpush(key, value);
        if (this.redis) {
            return this.redis.lpush(key, JSON.stringify(value));
        }
        return 0;
    }

    async keys(pattern: string): Promise<string[]> {
        if (this.useVercelKV) return vercelKv.keys(pattern);
        if (this.redis) return this.redis.keys(pattern);
        return [];
    }

    async sismember(key: string, member: any): Promise<number> {
        if (this.useVercelKV) return vercelKv.sismember(key, member);
        if (this.redis) return this.redis.sismember(key, member);
        return 0;
    }

    async del(key: string): Promise<void> {
        if (this.useVercelKV) {
            await vercelKv.del(key);
        } else if (this.redis) {
            await this.redis.del(key);
        }
    }
}

export const kv = new KVAdapter();

// ============================================
// USER MANAGEMENT
// ============================================

export interface User {
    id: string;
    email: string;
    password?: string; // Hashed password
    name: string;
    referralCode: string;
    referredBy?: string;
    points: number;
    debatesCount: number;
    isAdmin: boolean;
    createdAt: string;
    lastLogin: string;
}

// Get total users count
export async function getTotalUsers(): Promise<number> {
    return (await kv.get<number>('total_users')) || 0;
}

// Create new user
export async function createUser(email: string, password?: string, referredBy?: string): Promise<User> {
    // Robust UUID generation
    let userId: string;
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        userId = crypto.randomUUID();
    } else {
        // Fallback for older environments
        userId = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    const referralCode = generateReferralCode();

    let hashedPassword = undefined;
    if (password) {
        hashedPassword = await hash(password, 10);
    }

    const user: User = {
        id: userId,
        email,
        password: hashedPassword,
        name: email.split('@')[0],
        referralCode,
        referredBy,
        points: 200, // Welcome bonus
        debatesCount: 0,
        isAdmin: false,
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString()
    };

    // Save user
    await kv.set(`user:${userId}`, user);
    await kv.set(`email:${email}`, userId);
    await kv.set(`refcode:${referralCode}`, userId);

    // Increment total
    await kv.incr('total_users');

    return user;
}

// Get user by ID
export async function getUser(userId: string): Promise<User | null> {
    return await kv.get<User>(`user:${userId}`);
}

// Get user by email
export async function getUserByEmail(email: string): Promise<User | null> {
    const userId = await kv.get<string>(`email:${email}`);
    if (!userId) return null;
    return getUser(userId);
}

// Update user
export async function updateUser(userId: string, updates: Partial<User>): Promise<void> {
    const user = await getUser(userId);
    if (!user) throw new Error('User not found');

    const updated = { ...user, ...updates };
    await kv.set(`user:${userId}`, updated);
}

// ============================================
// REFERRAL SYSTEM
// ============================================

function generateReferralCode(): string {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
}

export async function validateReferralCode(code: string): Promise<boolean> {
    const userId = await kv.get<string>(`refcode:${code}`);
    return !!userId;
}

export async function processReferral(newUserId: string, referralCode: string): Promise<void> {
    const referrerId = await kv.get<string>(`refcode:${referralCode}`);
    if (!referrerId) return;

    // Award points to referrer
    await addPoints(referrerId, 300, `Referral: ${newUserId} signed up`);

    // Track referral
    await kv.sadd(`referrals:${referrerId}`, newUserId);
}

// ============================================
// POINTS SYSTEM
// ============================================

export async function addPoints(userId: string, amount: number, reason: string): Promise<number> {
    const user = await getUser(userId);
    if (!user) throw new Error('User not found');

    user.points += amount;
    await updateUser(userId, { points: user.points });

    // Log transaction
    await kv.lpush(`transactions:${userId}`, {
        amount,
        reason,
        timestamp: Date.now(),
        balance: user.points
    });

    return user.points;
}

export async function deductPoints(userId: string, amount: number, reason: string): Promise<boolean> {
    const user = await getUser(userId);
    if (!user) return false;
    if (user.points < amount) return false;

    await addPoints(userId, -amount, reason);
    return true;
}

// ============================================
// ADMIN FUNCTIONS
// ============================================

export async function getAllUsers(limit = 100): Promise<User[]> {
    const total = await getTotalUsers();
    const users: User[] = [];

    for (let i = 0; i < Math.min(total, limit); i++) {
        // This is simplified - in production, use cursor-based pagination
        const keys = await kv.keys('user:*');
        for (const key of keys.slice(0, limit)) {
            const user = await kv.get<User>(key);
            if (user) users.push(user);
        }
        break;
    }

    return users;
}

export async function getUserStats() {
    const total = await getTotalUsers();

    return {
        totalUsers: total,
    };
}

// ============================================
// SHARE & ANTI-CHEAT SYSTEM
// ============================================

export async function validateShareUrl(url: string): Promise<boolean> {
    try {
        const parsed = new URL(url);
        // Basic validation for FB/Zalo/LinkedIn
        const validDomains = ['facebook.com', 'zalo.me', 'linkedin.com', 'twitter.com', 'x.com'];
        if (!validDomains.some(domain => parsed.hostname.includes(domain))) {
            return false;
        }
        return true;
    } catch (e) {
        return false;
    }
}

// Atomic rate limiting: returns true if allowed, false if limit exceeded
export async function tryClaimShareReward(userId: string, postUrl: string): Promise<{ success: boolean; reason?: string }> {
    const today = new Date().toISOString().split('T')[0];

    // 1. Check for duplicate URL (Anti-spam)
    const urlKey = `shares:urls:${userId}:${today}`;
    const isDuplicate = await kv.sismember(urlKey, postUrl);
    if (isDuplicate) {
        return { success: false, reason: "Link này đã được tính điểm hôm nay rồi." };
    }

    // 2. Atomic Increment & Check Limit
    const countKey = `shares:count:${userId}:${today}`;
    const currentCount = await kv.incr(countKey);

    if (currentCount > 3) {
        // Revert increment (optional, but keeps count accurate-ish) or just ignore
        return { success: false, reason: "Bạn đã hết lượt nhận điểm chia sẻ hôm nay (3/3)." };
    }

    // 3. Mark URL as used
    await kv.sadd(urlKey, postUrl);

    // 4. Log share
    await kv.lpush(`share_logs:${userId}`, {
        url: postUrl,
        timestamp: Date.now(),
        date: today
    });

    // 5. Award points
    await addPoints(userId, 30, 'Chia sẻ bài viết công khai');

    return { success: true };
}

// ============================================
// SYSTEM CONFIG
// ============================================

export interface RoundsConfig {
    [step: string]: number;
}

const DEFAULT_ROUNDS_CONFIG: RoundsConfig = {
    '1_TOPIC': 3,
    '2_MODEL': 3,
    '3_OUTLINE': 3,
    '4_SURVEY': 2
};

export async function getRoundsConfig(): Promise<RoundsConfig> {
    const config = await kv.get<RoundsConfig>('system:rounds_config');
    return config || DEFAULT_ROUNDS_CONFIG;
}

export async function setRoundsConfig(config: RoundsConfig): Promise<void> {
    await kv.set('system:rounds_config', config);
}

// ============================================
// SESSION MANAGEMENT
// ============================================

export interface StepResult {
    aiOutput: string;
    userFinal?: string;
    mermaidCode?: string;
    status: 'draft' | 'finalized';
    editedAt?: string;
    note?: string;
}

export interface SessionData {
    metadata: {
        userId: string;
        sessionId: string;
        createdAt: string;
        level: string;
        language: 'vi' | 'en';
    };
    step1_topic?: StepResult;
    step2_model?: StepResult;
    step3_outline?: StepResult;
    step4_survey?: StepResult;
    step5_gtm?: StepResult;
}

export async function saveStepResult(
    userId: string,
    sessionId: string,
    step: WorkflowStep,
    data: StepResult
): Promise<void> {
    const sessionKey = `session:${userId}:${sessionId}`;
    const session = await kv.get<SessionData>(sessionKey) || {
        metadata: {
            userId,
            sessionId,
            createdAt: new Date().toISOString(),
            level: 'MASTER',
            language: 'vi'
        }
    };

    const stepKey = `step${step.charAt(0)}_${step.split('_')[1].toLowerCase()}` as keyof Omit<SessionData, 'metadata'>;
    session[stepKey] = data;

    await kv.set(sessionKey, session);
}

/**
 * Cloud Persistence for SavedProject (Integration with LocalStorage)
 */
export async function saveCloudProject(userId: string, project: any): Promise<void> {
    const key = `project:${userId}:${project.id}`;
    await kv.set(key, project);
    // Add to user's project list
    await kv.sadd(`user:${userId}:projects`, project.id);
}

export async function getCloudProject(userId: string, projectId: string): Promise<any | null> {
    return await kv.get(`project:${userId}:${projectId}`);
}

export async function listCloudProjects(userId: string): Promise<any[]> {
    const projectIds = await kv.get<string[]>(`user:${userId}:projects`) || [];
    const projects: any[] = [];

    // sadd in kv returns 1/0, but some KV implementations might return the set if asked differently
    // Here we assume sadd followed by smembers or similar if supported.
    // Our KVAdapter doesn't have smembers yet. Let's add it or use keys.

    const keys = await kv.keys(`project:${userId}:*`);
    for (const key of keys) {
        const project = await kv.get(key);
        if (project) projects.push(project);
    }

    return projects.sort((a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
}

export async function deleteCloudProject(userId: string, projectId: string): Promise<void> {
    const key = `project:${userId}:${projectId}`;
    await kv.del(key);
    // Remove from set if possible (optional for now as we use keys() in list)
}

export async function getFinalizedStepResult(
    userId: string,
    sessionId: string,
    step: WorkflowStep
): Promise<string | null> {
    const sessionKey = `session:${userId}:${sessionId}`;
    const session = await kv.get<SessionData>(sessionKey);
    if (!session) return null;

    const stepKey = `step${step.charAt(0)}_${step.split('_')[1].toLowerCase()}` as keyof Omit<SessionData, 'metadata'>;
    const stepData = session[stepKey];

    return stepData?.userFinal || stepData?.aiOutput || null;
}

export async function getSessionData(
    userId: string,
    sessionId: string
): Promise<SessionData | null> {
    const sessionKey = `session:${userId}:${sessionId}`;
    return await kv.get<SessionData>(sessionKey);
}



// ============================================
// PROMPT CONFIG (Hải Rong Chơi)
// ============================================

export interface PostWriterPrompts {
    writer: string;
    critic: string;
}

export async function savePostPrompts(prompts: PostWriterPrompts) {
    await kv.set('config:prompt:post_writer', prompts);
}

export async function getPostPrompts(): Promise<PostWriterPrompts | null> {
    return await kv.get<PostWriterPrompts>('config:prompt:post_writer');
}
