import React, { useState, useEffect, useRef } from 'react';
import { Search, Plus, Trash2, Edit, SlidersHorizontal, Loader2 } from 'lucide-react';
import { getUsersAPI, toggleUserStatusAPI, deleteUserAPI } from '../services/userService';
import { getRolesAPI, deleteRoleAPI } from '../services/roleService';
import CreateUserModal from './manage-users/CreateUserModal';
import CreateRoleModal from './manage-users/CreateRoleModal';
import UserDetailsModal from './manage-users/UserDetailsModal';
import RoleDetailsModal from './manage-users/RoleDetailsModal';
import { projectService } from '../../projects/services/project.service';
import { ListSkeleton } from '../../../shared/components/Skeletons';

export default function ManageUsersRoles() {
    const [activeSubTab, setActiveSubTab] = useState('users');
    
    const [users, setUsers] = useState([]);
    const [roles, setRoles] = useState([]);
    const [projects, setProjects] = useState([]); 
    const [isLoading, setIsLoading] = useState(false);
    
    const [searchQuery, setSearchQuery] = useState('');
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    
    const [filterStatus, setFilterStatus] = useState(''); 
    const [filterRole, setFilterRole] = useState('');
    const [filterProject, setFilterProject] = useState('');
    
    const filterRef = useRef(null);

    const [isUserModalOpen, setIsUserModalOpen] = useState(false);
    const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null); 
    const [isUserDetailsOpen, setIsUserDetailsOpen] = useState(false);
    const [selectedRoleId, setSelectedRoleId] = useState(null);
    const [isRoleDetailsOpen, setIsRoleDetailsOpen] = useState(false);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (filterRef.current && !filterRef.current.contains(event.target)) {
                setIsFilterOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const fetchAllData = async () => {
        setIsLoading(true);
        try {
            const [projectsRes, usersRes, rolesRes] = await Promise.all([
                projectService.getAllProjects().catch(() => ({ data: [] })),
                getUsersAPI().catch(() => ({ data: [] })),
                getRolesAPI().catch(() => ({ data: [] }))
            ]);

            if (projectsRes.data) setProjects(projectsRes.data);
            if (usersRes.data) setUsers(usersRes.data);
            if (rolesRes.data) setRoles(rolesRes.data);
        } catch (err) {
            console.error("Failed to load users/roles data", err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { 
        fetchAllData(); 
    }, []);

    const toggleStatus = async (e, id, currentStatus) => {
        e.stopPropagation();
        try {
            await toggleUserStatusAPI(id, !currentStatus);
            fetchAllData();
        } catch (err) { alert(err.message); }
    };

    const handleDeleteRole = async (id) => {
        if (!window.confirm("Are you sure you want to delete this role?")) return;
        try {
            await deleteRoleAPI(id);
            fetchAllData();
        } catch (err) { alert(err.message); }
    };

    const filteredUsers = users.filter(u => {
        const matchesSearch = u.name?.toLowerCase().includes(searchQuery.toLowerCase()) || u.employeeId?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = filterStatus ? (filterStatus === 'ACTIVE' ? u.isActive : !u.isActive) : true;
        const matchesRole = filterRole ? u.role?.id === filterRole : true;
        const matchesProject = filterProject ? u.projects?.some(p => p.id === filterProject) : true;
        return matchesSearch && matchesStatus && matchesRole && matchesProject;
    });

    const filteredRoles = roles.filter(r => r.name?.toLowerCase().includes(searchQuery.toLowerCase()));

    return (
        <div style={{ fontFamily: "'Lexend', sans-serif" }}>

            {/* Users / Roles sub-toggle */}
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-700 rounded-xl p-1 w-fit mb-4">
                <button onClick={() => setActiveSubTab('users')}
                    className={`px-5 py-1.5 rounded-lg text-xs font-semibold transition-all ${activeSubTab === 'users' ? 'bg-brand-600 text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'}`}>
                    Users
                </button>
                <button onClick={() => setActiveSubTab('roles')}
                    className={`px-5 py-1.5 rounded-lg text-xs font-semibold transition-all ${activeSubTab === 'roles' ? 'bg-brand-600 text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'}`}>
                    Roles
                </button>
            </div>

            {/* ── USERS PANE ── */}
            {activeSubTab === 'users' && (
                <div>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
                        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">Users List</h3>
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                            <div className="relative flex-1 sm:flex-none sm:w-52">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input type="text" placeholder="Search" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-brand-600 transition-colors shadow-sm"/>
                            </div>
                            
                            <div className="relative" ref={filterRef}>
                                <button onClick={() => setIsFilterOpen(!isFilterOpen)} className="flex items-center gap-1.5 border border-slate-200 dark:border-slate-600 bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-medium px-3 py-2 rounded-xl transition-colors shadow-sm">
                                    <SlidersHorizontal className="w-3.5 h-3.5" /> Filter
                                </button>
                                {isFilterOpen && (
                                    <div className="absolute top-full right-0 mt-2 w-64 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-xl rounded-2xl p-4 z-50">
                                        <div className="space-y-3">
                                            <select value={filterProject} onChange={e => setFilterProject(e.target.value)} className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-xl text-xs font-bold bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 outline-none">
                                                <option value="">Project Name (All)</option>
                                                {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                            </select>
                                            <select value={filterRole} onChange={e => setFilterRole(e.target.value)} className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-xl text-xs font-bold bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 outline-none">
                                                <option value="">Role Name (All)</option>
                                                {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                                            </select>
                                            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-xl text-xs font-bold bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 outline-none">
                                                <option value="">Active/Inactive (All)</option>
                                                <option value="ACTIVE">Active</option>
                                                <option value="INACTIVE">Inactive</option>
                                            </select>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <button onClick={() => setIsUserModalOpen(true)}
                                className="flex items-center gap-1.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold px-3 py-2 rounded-xl transition-colors shadow-sm whitespace-nowrap">
                                <Plus className="w-3.5 h-3.5" /> Create User
                            </button>
                        </div>
                    </div>
                    
                    <div className="border border-slate-100 dark:border-slate-700 rounded-2xl overflow-hidden divide-y divide-slate-100 dark:divide-slate-700 bg-white dark:bg-slate-800 w-full">
                        {isLoading ? (
                            <ListSkeleton rows={5} />
                        ) : filteredUsers.length === 0 ? (
                            <p className="text-sm text-slate-400 text-center py-6 font-medium">No users found.</p>
                        ) : filteredUsers.map(u => (
                            <div key={u.id} className="flex items-center justify-between gap-3 px-4 py-3.5 cursor-pointer hover:bg-brand-50/50 dark:hover:bg-brand-900/10 transition-colors" onClick={() => { setSelectedUser(u); setIsUserDetailsOpen(true); }}>
                                <div className="flex-1 min-w-0">
                                    <p className="text-[13px] font-bold text-slate-700 dark:text-slate-200">{u.name}</p>
                                    <p className="text-[11px] mt-0.5 text-slate-500">Role: <span className="font-semibold text-brand-600 dark:text-brand-400">{u.role?.name || 'N/A'}</span></p>
                                    <p className="text-[11px] mt-0.5 text-slate-500">Project Name: <span className="font-semibold text-brand-600 dark:text-brand-400">{u.projects?.length > 0 ? u.projects.map(p => p.name).join(', ') : 'Unassigned'}</span></p>
                                </div>
                                <button onClick={(e) => toggleStatus(e, u.id, u.isActive)}
                                    className={`text-[10px] font-bold px-3 py-1 rounded-full flex-shrink-0 transition-colors ${u.isActive ? 'bg-green-500 hover:bg-green-600 text-white shadow-sm' : 'bg-slate-200 dark:bg-slate-600 hover:bg-slate-300 dark:hover:bg-slate-500 text-slate-600 dark:text-slate-300'}`}>
                                    {u.isActive ? 'Active' : 'Inactive'}
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ── ROLES PANE ── */}
            {activeSubTab === 'roles' && (
                <div>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
                        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">Roles List</h3>
                        <div className="flex items-center gap-2">
                            <div className="relative flex-1 sm:flex-none sm:w-52">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input type="text" placeholder="Search Roles" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-brand-600 transition-colors shadow-sm"/>
                            </div>
                            <button onClick={() => setIsRoleModalOpen(true)}
                                className="flex items-center gap-1.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold px-3 py-2 rounded-xl transition-colors shadow-sm whitespace-nowrap">
                                <Plus className="w-3.5 h-3.5" /> Create Role
                            </button>
                        </div>
                    </div>
                    <div className="border border-slate-100 dark:border-slate-700 rounded-2xl overflow-hidden divide-y divide-slate-100 dark:divide-slate-700 bg-white dark:bg-slate-800 w-full">
                        {isLoading ? (
                            <ListSkeleton rows={5} />
                        ) : filteredRoles.length === 0 ? (
                            <p className="text-sm text-slate-400 text-center py-6 font-medium">No roles found.</p>
                        ) : filteredRoles.map(r => (
                            <div
                                key={r.id}
                                className="flex items-center justify-between gap-3 px-4 py-3.5 hover:bg-brand-50/50 dark:hover:bg-brand-900/10 transition-colors cursor-pointer"
                                onClick={() => { setSelectedRoleId(r.id); setIsRoleDetailsOpen(true); }}
                            >
                                <div className="flex-1 min-w-0">
                                    <p className="text-[13px] font-bold text-slate-700 dark:text-slate-200">{r.name}</p>
                                    <p className="text-[11px] text-slate-500 mt-0.5">Assigned to: <span className="text-slate-600 dark:text-slate-300 font-medium">{r.stats?.users || 0} users</span></p>
                                    {r.description && <p className="text-[11px] text-slate-400 mt-0.5 truncate">{r.description}</p>}
                                </div>
                                <div className="flex items-center gap-2 flex-shrink-0" onClick={e => e.stopPropagation()}>
                                    <button onClick={(e) => { e.stopPropagation(); setSelectedRoleId(r.id); setIsRoleDetailsOpen(true); }} className="text-slate-400 hover:text-brand-600 transition-colors p-1.5 rounded-lg hover:bg-brand-50 dark:hover:bg-brand-900/20">
                                        <Edit className="w-3.5 h-3.5" />
                                    </button>
                                    <button onClick={(e) => { e.stopPropagation(); handleDeleteRole(r.id); }} className="text-slate-400 hover:text-red-500 transition-colors p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20">
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* MODALS */}
            <CreateUserModal isOpen={isUserModalOpen} onClose={() => setIsUserModalOpen(false)} roles={roles} projects={projects} onSuccess={fetchAllData} />
            <CreateRoleModal isOpen={isRoleModalOpen} onClose={() => setIsRoleModalOpen(false)} projects={projects} onSuccess={fetchAllData} />
            <UserDetailsModal isOpen={isUserDetailsOpen} onClose={() => setIsUserDetailsOpen(false)} user={selectedUser} roles={roles} onSuccess={fetchAllData} />
            <RoleDetailsModal isOpen={isRoleDetailsOpen} onClose={() => setIsRoleDetailsOpen(false)} roleId={selectedRoleId} onSuccess={fetchAllData} />
            
        </div>
    );
}
