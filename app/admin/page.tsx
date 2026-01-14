"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Shield, Users, Search, Award, AlertTriangle, Save } from "lucide-react";

export default function AdminPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [users, setUsers] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    // Edit state
    const [editingUser, setEditingUser] = useState<string | null>(null);
    const [editPoints, setEditPoints] = useState<number>(0);
    const [editReason, setEditReason] = useState("Admin bonus");

    useEffect(() => {
        if (status === "loading") return;

        if (!session || session.user?.email !== "foreverlove3004@gmail.com") {
            router.push("/"); // Kick unauthorized users
            return;
        }

        fetchUsers();
    }, [session, status, router]);

    const fetchUsers = async () => {
        try {
            const res = await fetch("/api/admin/users");
            const data = await res.json();
            if (data.users) {
                setUsers(data.users);
            }
        } catch (error) {
            console.error("Failed to fetch users", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdatePoints = async (userId: string) => {
        if (!editPoints) return;

        try {
            const res = await fetch("/api/admin/points", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId, points: Number(editPoints), reason: editReason }),
            });

            if (res.ok) {
                alert("Đã cập nhật điểm thành công!");
                setEditingUser(null);
                fetchUsers(); // Refresh list
            } else {
                alert("Lỗi khi cập nhật điểm.");
            }
        } catch (error) {
            alert("Lỗi kết nối.");
        }
    };

    if (status === "loading" || isLoading) {
        return <div className="min-h-screen flex items-center justify-center bg-slate-100">Loading Admin...</div>;
    }

    if (!session || session.user?.email !== "foreverlove3004@gmail.com") return null;

    const filteredUsers = users.filter(u =>
        u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.id.includes(searchTerm)
    );

    return (
        <div className="min-h-screen bg-slate-100 p-8">
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <Shield className="text-red-600" /> Admin Dashboard
                    </h1>
                    <div className="bg-white px-4 py-2 rounded-lg shadow-sm font-mono text-sm">
                        Total Users: {users.length}
                    </div>
                </div>

                {/* Search */}
                <div className="bg-white p-4 rounded-xl shadow-sm mb-6 flex gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-3 text-slate-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search by email, name, or ID..."
                            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200">
                                <th className="p-4 font-semibold text-slate-600 text-sm">User Info</th>
                                <th className="p-4 font-semibold text-slate-600 text-sm">Auth</th>
                                <th className="p-4 font-semibold text-slate-600 text-sm">Referral</th>
                                <th className="p-4 font-semibold text-slate-600 text-sm">Points</th>
                                <th className="p-4 font-semibold text-slate-600 text-sm text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredUsers.map(user => (
                                <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="p-4">
                                        <div className="font-bold text-slate-800">{user.name || "No Name"}</div>
                                        <div className="text-xs text-slate-500 font-mono">{user.id}</div>
                                    </td>
                                    <td className="p-4">
                                        <div className="text-sm text-slate-700">{user.email}</div>
                                        {user.isAdmin && <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-bold">ADMIN</span>}
                                    </td>
                                    <td className="p-4">
                                        <div className="text-sm font-mono bg-blue-50 text-blue-700 px-2 py-1 rounded w-fit">
                                            {user.referralCode}
                                        </div>
                                        {user.referredBy && <div className="text-xs text-slate-400 mt-1">Ref by: {user.referredBy}</div>}
                                    </td>
                                    <td className="p-4">
                                        <div className="font-bold text-slate-900 flex items-center gap-1">
                                            <Award size={16} className="text-yellow-500" />
                                            {user.points}
                                        </div>
                                    </td>
                                    <td className="p-4 text-right">
                                        {editingUser === user.id ? (
                                            <div className="flex flex-col gap-2 items-end">
                                                <input
                                                    type="number"
                                                    className="w-24 px-2 py-1 border rounded text-sm"
                                                    placeholder="+/- Pts"
                                                    onChange={(e) => setEditPoints(Number(e.target.value))}
                                                />
                                                <input
                                                    type="text"
                                                    className="w-32 px-2 py-1 border rounded text-xs"
                                                    placeholder="Reason"
                                                    value={editReason}
                                                    onChange={(e) => setEditReason(e.target.value)}
                                                />
                                                <div className="flex gap-1">
                                                    <button onClick={() => setEditingUser(null)} className="text-xs px-2 py-1 bg-slate-200 rounded hover:bg-slate-300">Cancel</button>
                                                    <button onClick={() => handleUpdatePoints(user.id)} className="text-xs px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-1">
                                                        <Save size={12} /> Save
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => {
                                                    setEditingUser(user.id);
                                                    setEditPoints(0);
                                                }}
                                                className="text-sm px-3 py-1.5 bg-white border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 font-medium transition-all shadow-sm"
                                            >
                                                Edit Points
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
