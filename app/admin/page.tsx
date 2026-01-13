'use client';

import { useEffect, useState } from 'react';

interface User {
    id: string;
    email: string;
    name: string;
    points: number;
    debatesCount: number;
    referralCode: string;
    createdAt: string;
}

export default function AdminPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [stats, setStats] = useState({ totalUsers: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [usersRes, statsRes] = await Promise.all([
                fetch('/api/admin/users'),
                fetch('/api/admin/stats')
            ]);

            const usersData = await usersRes.json();
            const statsData = await statsRes.json();

            setUsers(usersData);
            setStats(statsData);
        } catch (error) {
            console.error('Failed to load admin data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="p-8">Loading...</div>;
    }

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4 mb-8">
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-gray-600 text-sm">Total Users</h3>
                    <p className="text-3xl font-bold">{stats.totalUsers}</p>
                </div>
            </div>

            {/* User Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="px-4 py-3 text-left">Email</th>
                            <th className="px-4 py-3 text-left">Points</th>
                            <th className="px-4 py-3 text-left">Debates</th>
                            <th className="px-4 py-3 text-left">Referral Code</th>
                            <th className="px-4 py-3 text-left">Created</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user) => (
                            <tr key={user.id} className="border-t">
                                <td className="px-4 py-3">{user.email}</td>
                                <td className="px-4 py-3">{user.points}</td>
                                <td className="px-4 py-3">{user.debatesCount}</td>
                                <td className="px-4 py-3 font-mono">{user.referralCode}</td>
                                <td className="px-4 py-3">
                                    {new Date(user.createdAt).toLocaleDateString()}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
