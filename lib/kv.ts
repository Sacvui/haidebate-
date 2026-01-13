import { kv } from '@vercel/kv';

// ============================================
// USER MANAGEMENT
// ============================================

export interface User {
    id: string;
    email: string;
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
export async function createUser(email: string, referredBy?: string): Promise<User> {
    const userId = crypto.randomUUID();
    const referralCode = generateReferralCode();

    const user: User = {
        id: userId,
        email,
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

return {
    totalUsers: total,
    // Add more stats as needed
};
}

// ============================================
// SHARE & ANTI-CHEAT SYSTEM
// ============================================

export async function validateShareUrl(url: string): Promise<boolean> {
    // Basic validation for FB/Zalo/LinkedIn
    const validDomains = ['facebook.com', 'zalo.me', 'linkedin.com', 'twitter.com'];
    if (!validDomains.some(domain => url.includes(domain))) {
        return false;
    }
    return true;
}

export async function canShare(userId: string): Promise<boolean> {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const shareCount = await kv.get<number>(`shares:${userId}:${today}`) || 0;
    return shareCount < 3; // Max 3 shares/day
}

export async function submitShare(userId: string, postUrl: string): Promise<void> {
    const today = new Date().toISOString().split('T')[0];

    // Log share
    await kv.lpush(`share_logs:${userId}`, {
        url: postUrl,
        timestamp: Date.now(),
        date: today
    });

    // Increment daily counter
    await kv.incr(`shares:${userId}:${today}`);

    // Auto-award points (simplified for MVP)
    await addPoints(userId, 30, 'Chia sẻ bài viết công khai');
}
