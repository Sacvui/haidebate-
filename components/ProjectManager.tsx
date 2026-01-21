"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FolderOpen,
    Plus,
    Trash2,
    Edit3,
    ExternalLink,
    Clock,
    BookOpen,
    Rocket,
    GraduationCap,
    Search,
    MoreVertical,
    Check,
    X,
    AlertTriangle
} from 'lucide-react';
import {
    getAllProjects,
    deleteProject,
    renameProject,
    SavedProject,
    getProjectProgress,
    getProjectTypeLabel,
    getLevelLabel,
    getStepLabel
} from '@/lib/projectStorage';

interface ProjectManagerProps {
    onSelectProject: (project: SavedProject) => void;
    onCreateNew: () => void;
}

export const ProjectManager: React.FC<ProjectManagerProps> = ({
    onSelectProject,
    onCreateNew
}) => {
    const [projects, setProjects] = useState<SavedProject[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editName, setEditName] = useState('');
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
    const [activeMenu, setActiveMenu] = useState<string | null>(null);

    useEffect(() => {
        const load = async () => {
            const all = await getAllProjects();
            setProjects(all.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()));
        };
        load();
    }, []);

    const filteredProjects = projects.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.topic.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleDelete = async (id: string) => {
        await deleteProject(id);
        const all = await getAllProjects();
        setProjects(all.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()));
        setDeleteConfirm(null);
    };

    const handleRename = async (id: string) => {
        if (!editName.trim()) return;
        await renameProject(id, editName.trim());
        const all = await getAllProjects();
        setProjects(all.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()));
        setEditingId(null);
        setEditName('');
    };

    const startEditing = (project: SavedProject) => {
        setEditingId(project.id);
        setEditName(project.name);
        setActiveMenu(null);
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffHours < 1) return 'Vừa xong';
        if (diffHours < 24) return `${diffHours} giờ trước`;
        if (diffDays < 7) return `${diffDays} ngày trước`;
        return date.toLocaleDateString('vi-VN');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                        <FolderOpen className="text-blue-400" />
                        Dự án của tôi
                    </h1>
                    <p className="text-slate-400">Quản lý và tiếp tục các đề tài nghiên cứu của bạn</p>
                </motion.div>

                {/* Actions Bar */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="flex flex-col sm:flex-row gap-4 mb-6"
                >
                    {/* Search */}
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Tìm kiếm dự án..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                        />
                    </div>

                    {/* Create New Button */}
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={onCreateNew}
                        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all"
                    >
                        <Plus className="w-5 h-5" />
                        Tạo dự án mới
                    </motion.button>
                </motion.div>

                {/* Projects Grid */}
                {filteredProjects.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center py-20"
                    >
                        <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-slate-800 flex items-center justify-center">
                            <FolderOpen className="w-12 h-12 text-slate-600" />
                        </div>
                        <h3 className="text-xl font-medium text-slate-400 mb-2">
                            {searchQuery ? 'Không tìm thấy dự án' : 'Chưa có dự án nào'}
                        </h3>
                        <p className="text-slate-500 mb-6">
                            {searchQuery ? 'Thử tìm kiếm với từ khóa khác' : 'Bắt đầu bằng cách tạo dự án nghiên cứu mới'}
                        </p>
                        {!searchQuery && (
                            <button
                                onClick={onCreateNew}
                                className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
                            >
                                Tạo dự án đầu tiên
                            </button>
                        )}
                    </motion.div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                    >
                        <AnimatePresence mode="popLayout">
                            {filteredProjects.map((project, index) => (
                                <motion.div
                                    key={project.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="group relative bg-gradient-to-br from-slate-800/80 to-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-5 hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300"
                                >
                                    {/* Project Type Badge */}
                                    <div className="absolute top-4 right-4 flex items-center gap-2">
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${project.projectType === 'STARTUP'
                                            ? 'bg-orange-500/20 text-orange-400'
                                            : 'bg-blue-500/20 text-blue-400'
                                            }`}>
                                            {project.projectType === 'STARTUP' ? (
                                                <><Rocket className="w-3 h-3 inline mr-1" />{getProjectTypeLabel(project.projectType)}</>
                                            ) : (
                                                <><BookOpen className="w-3 h-3 inline mr-1" />{getProjectTypeLabel(project.projectType)}</>
                                            )}
                                        </span>

                                        {/* More Menu */}
                                        <div className="relative">
                                            <button
                                                onClick={() => setActiveMenu(activeMenu === project.id ? null : project.id)}
                                                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/50 transition-colors"
                                            >
                                                <MoreVertical className="w-4 h-4" />
                                            </button>

                                            <AnimatePresence>
                                                {activeMenu === project.id && (
                                                    <motion.div
                                                        initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                                        exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                                        className="absolute right-0 top-full mt-1 w-40 bg-slate-800 border border-slate-700 rounded-xl shadow-xl z-10 overflow-hidden"
                                                    >
                                                        <button
                                                            onClick={() => startEditing(project)}
                                                            className="w-full px-4 py-2.5 text-left text-sm text-slate-300 hover:bg-slate-700/50 flex items-center gap-2"
                                                        >
                                                            <Edit3 className="w-4 h-4" />
                                                            Đổi tên
                                                        </button>
                                                        <button
                                                            onClick={() => { setDeleteConfirm(project.id); setActiveMenu(null); }}
                                                            className="w-full px-4 py-2.5 text-left text-sm text-red-400 hover:bg-red-500/10 flex items-center gap-2"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                            Xóa
                                                        </button>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    </div>

                                    {/* Project Name */}
                                    {editingId === project.id ? (
                                        <div className="flex items-center gap-2 mb-3 pr-20">
                                            <input
                                                type="text"
                                                value={editName}
                                                onChange={(e) => setEditName(e.target.value)}
                                                onKeyDown={(e) => e.key === 'Enter' && handleRename(project.id)}
                                                autoFocus
                                                className="flex-1 px-3 py-1.5 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                            <button onClick={() => handleRename(project.id)} className="p-1.5 text-green-400 hover:bg-green-500/20 rounded-lg">
                                                <Check className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => setEditingId(null)} className="p-1.5 text-slate-400 hover:bg-slate-700 rounded-lg">
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ) : (
                                        <h3 className="text-lg font-semibold text-white mb-1 pr-20 line-clamp-2">
                                            {project.name}
                                        </h3>
                                    )}

                                    {/* Topic Preview */}
                                    <p className="text-sm text-slate-400 mb-4 line-clamp-2">
                                        {project.topic}
                                    </p>

                                    {/* Progress Bar */}
                                    <div className="mb-4">
                                        <div className="flex justify-between text-xs text-slate-500 mb-1">
                                            <span>Tiến độ</span>
                                            <span>{getProjectProgress(project)}%</span>
                                        </div>
                                        <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${getProjectProgress(project)}%` }}
                                                transition={{ duration: 0.5, delay: index * 0.05 }}
                                                className={`h-full rounded-full ${getProjectProgress(project) === 100
                                                    ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                                                    : 'bg-gradient-to-r from-blue-500 to-purple-500'
                                                    }`}
                                            />
                                        </div>
                                    </div>

                                    {/* Meta Info */}
                                    <div className="flex items-center justify-between text-xs text-slate-500 mb-4">
                                        <span className="flex items-center gap-1">
                                            <GraduationCap className="w-3.5 h-3.5" />
                                            {getLevelLabel(project.level)}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Clock className="w-3.5 h-3.5" />
                                            {formatDate(project.updatedAt)}
                                        </span>
                                    </div>

                                    {/* Current Step */}
                                    <div className="text-xs text-slate-400 mb-4">
                                        Bước hiện tại: <span className="text-blue-400 font-medium">{getStepLabel(project.currentStep)}</span>
                                    </div>

                                    {/* Open Button */}
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => onSelectProject(project)}
                                        className="w-full py-2.5 bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 text-blue-400 font-medium rounded-xl hover:from-blue-600/30 hover:to-purple-600/30 hover:border-blue-500/50 transition-all flex items-center justify-center gap-2"
                                    >
                                        <ExternalLink className="w-4 h-4" />
                                        Tiếp tục
                                    </motion.button>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </motion.div>
                )}

                {/* Delete Confirmation Modal */}
                <AnimatePresence>
                    {deleteConfirm && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                            onClick={() => setDeleteConfirm(null)}
                        >
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.9, opacity: 0 }}
                                onClick={(e) => e.stopPropagation()}
                                className="bg-slate-800 border border-slate-700 rounded-2xl p-6 max-w-sm w-full shadow-2xl"
                            >
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-2 rounded-full bg-red-500/20">
                                        <AlertTriangle className="w-6 h-6 text-red-400" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-white">Xác nhận xóa</h3>
                                </div>
                                <p className="text-slate-400 mb-6">
                                    Bạn có chắc muốn xóa dự án này? Hành động này không thể hoàn tác.
                                </p>
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setDeleteConfirm(null)}
                                        className="flex-1 py-2.5 bg-slate-700 text-white rounded-xl hover:bg-slate-600 transition-colors"
                                    >
                                        Hủy
                                    </button>
                                    <button
                                        onClick={() => handleDelete(deleteConfirm)}
                                        className="flex-1 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors"
                                    >
                                        Xóa
                                    </button>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default ProjectManager;
