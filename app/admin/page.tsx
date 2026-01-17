"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Shield, Users, Search, Award, AlertTriangle, Save, Settings, PenTool, ExternalLink } from "lucide-react";
import type { RoundsConfig } from "@/lib/kv";

export default function AdminPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [users, setUsers] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [activeTab, setActiveTab] = useState<'users' | 'config' | 'tools'>('users');

    // Edit state
    const [editingUser, setEditingUser] = useState<string | null>(null);
    const [editPoints, setEditPoints] = useState<number>(0);
    const [editReason, setEditReason] = useState("Admin bonus");

    // Config state
    const [roundsConfig, setRoundsConfig] = useState<RoundsConfig>({
        '1_TOPIC': 3,
        '2_MODEL': 3,
        '3_OUTLINE': 3,
        '4_SURVEY': 2
    });
    const [isSavingConfig, setIsSavingConfig] = useState(false);


    useEffect(() => {
        if (status === "loading") return;

        if (!session || session.user?.email !== "foreverlove3004@gmail.com") {
            router.push("/"); // Kick unauthorized users
            return;
        }

        fetchUsers();
        fetchConfig();
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

    const fetchConfig = async () => {
        try {
            const res = await fetch("/api/admin/config");
            const data = await res.json();
            if (data.config) {
                setRoundsConfig(data.config);
            }
        } catch (error) {
            console.error("Failed to fetch config", error);
        }
    };

    const handleSaveConfig = async () => {
        setIsSavingConfig(true);
        try {
            const res = await fetch("/api/admin/config", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ config: roundsConfig }),
            });

            if (res.ok) {
                alert("Đã lưu cấu hình thành công!");
            } else {
                const data = await res.json();
                alert(`Lỗi: ${data.error}`);
            }
        } catch (error) {
            alert("Lỗi kết nối.");
        } finally {
            setIsSavingConfig(false);
        }
    };

    const handleResetConfig = () => {
        setRoundsConfig({
            '1_TOPIC': 3,
            '2_MODEL': 3,
            '3_OUTLINE': 3,
            '4_SURVEY': 2
        });
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

                {/* Tabs */}
                <div className="flex gap-2 mb-6">
                    <button
                        onClick={() => setActiveTab('users')}
                        className={`px-6 py-2 rounded-lg font-medium transition-all ${activeTab === 'users'
                            ? 'bg-blue-600 text-white shadow-md'
                            : 'bg-white text-slate-600 hover:bg-slate-50'
                            }`}
                    >
                        <Users className="inline mr-2" size={18} />
                        Quản lý Users
                    </button>
                    <button
                        onClick={() => setActiveTab('config')}
                        className={`px-6 py-2 rounded-lg font-medium transition-all ${activeTab === 'config'
                            ? 'bg-blue-600 text-white shadow-md'
                            : 'bg-white text-slate-600 hover:bg-slate-50'
                            }`}
                    >
                        <Settings className="inline mr-2" size={18} />
                        Cấu hình hệ thống
                    </button>
                    <button
                        onClick={() => setActiveTab('tools')}
                        className={`px-6 py-2 rounded-lg font-medium transition-all ${activeTab === 'tools'
                            ? 'bg-blue-600 text-white shadow-md'
                            : 'bg-white text-slate-600 hover:bg-slate-50'
                            }`}
                    >
                        <PenTool className="inline mr-2" size={18} />
                        Công cụ AI
                    </button>
                </div>

                {/* Users Tab */}
                {activeTab === 'users' && (
                    <>
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
                    </>
                )}

                {/* Config Tab */}
                {activeTab === 'config' && (
                    <div className="bg-white rounded-xl shadow-lg p-8">
                        <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                            <Settings className="text-blue-600" />
                            Cấu hình số vòng tranh luận
                        </h2>

                        <div className="space-y-6 max-w-2xl">
                            {/* Topic */}
                            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                                <div>
                                    <h3 className="font-semibold text-slate-800">Bước 1: TOPIC (Thẩm định đề tài)</h3>
                                    <p className="text-sm text-slate-500">Số vòng Writer vs Critic tranh luận</p>
                                </div>
                                <input
                                    type="number"
                                    min="1"
                                    max="10"
                                    value={roundsConfig['1_TOPIC']}
                                    onChange={(e) => setRoundsConfig({ ...roundsConfig, '1_TOPIC': Number(e.target.value) })}
                                    className="w-20 px-3 py-2 border border-slate-300 rounded-lg text-center font-bold text-lg"
                                />
                            </div>

                            {/* Model */}
                            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                                <div>
                                    <h3 className="font-semibold text-slate-800">Bước 2: MODEL (Xây dựng mô hình)</h3>
                                    <p className="text-sm text-slate-500">Số vòng Writer vs Critic tranh luận</p>
                                </div>
                                <input
                                    type="number"
                                    min="1"
                                    max="10"
                                    value={roundsConfig['2_MODEL']}
                                    onChange={(e) => setRoundsConfig({ ...roundsConfig, '2_MODEL': Number(e.target.value) })}
                                    className="w-20 px-3 py-2 border border-slate-300 rounded-lg text-center font-bold text-lg"
                                />
                            </div>

                            {/* Outline */}
                            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                                <div>
                                    <h3 className="font-semibold text-slate-800">Bước 3: OUTLINE (Hoàn thiện đề cương)</h3>
                                    <p className="text-sm text-slate-500">Số vòng Writer vs Critic tranh luận</p>
                                </div>
                                <input
                                    type="number"
                                    min="1"
                                    max="10"
                                    value={roundsConfig['3_OUTLINE']}
                                    onChange={(e) => setRoundsConfig({ ...roundsConfig, '3_OUTLINE': Number(e.target.value) })}
                                    className="w-20 px-3 py-2 border border-slate-300 rounded-lg text-center font-bold text-lg"
                                />
                            </div>

                            {/* Survey */}
                            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                                <div>
                                    <h3 className="font-semibold text-slate-800">Bước 4: SURVEY (Xây dựng thang đo)</h3>
                                    <p className="text-sm text-slate-500">Số vòng Writer vs Critic tranh luận</p>
                                </div>
                                <input
                                    type="number"
                                    min="1"
                                    max="10"
                                    value={roundsConfig['4_SURVEY']}
                                    onChange={(e) => setRoundsConfig({ ...roundsConfig, '4_SURVEY': Number(e.target.value) })}
                                    className="w-20 px-3 py-2 border border-slate-300 rounded-lg text-center font-bold text-lg"
                                />
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3 pt-4">
                                <button
                                    onClick={handleResetConfig}
                                    className="px-6 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 font-medium"
                                >
                                    Reset về mặc định
                                </button>
                                <button
                                    onClick={handleSaveConfig}
                                    disabled={isSavingConfig}
                                    className="flex-1 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    <Save size={18} />
                                    {isSavingConfig ? 'Đang lưu...' : 'Lưu cấu hình'}
                                </button>
                            </div>

                            {/* Info */}
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
                                <strong>ℹ️ Lưu ý:</strong>
                                <ul className="list-disc ml-5 mt-2 space-y-1">
                                    <li>Số vòng phải từ 1 đến 10</li>
                                    <li>Thay đổi sẽ áp dụng cho tất cả sessions mới</li>
                                    <li>Sessions đang chạy không bị ảnh hưởng</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                )}

                {/* Tools Tab */}
                {activeTab === 'tools' && (
                    <div className="bg-white rounded-xl shadow-lg p-8">
                        <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                            <PenTool className="text-blue-600" />
                            Kho Công Cụ AI
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {/* Card: Post Writer */}
                            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl p-6 text-white shadow-lg relative overflow-hidden group hover:shadow-xl transition-all hover:-translate-y-1 cursor-pointer" onClick={() => router.push('/admin/post-writer')}>
                                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                    <PenTool size={100} />
                                </div>
                                <h3 className="text-xl font-bold mb-2 relative z-10">Hải Rong Chơi Writer</h3>
                                <p className="text-indigo-100 text-sm mb-4 relative z-10">
                                    Viết content Facebook phong cách "Bụi bặm - Học thuật".
                                </p>
                                <button className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors relative z-10">
                                    Truy cập ngay <ExternalLink size={14} />
                                </button>
                            </div>

                            {/* Placeholder for future tools */}
                            <div className="border border-dashed border-slate-300 rounded-xl p-6 flex flex-col items-center justify-center text-slate-400">
                                <Shield size={40} className="mb-2 opacity-50" />
                                <p className="text-sm font-medium">Sắp có công cụ mới...</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
