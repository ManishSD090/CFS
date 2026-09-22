// src/app/router/AppRouter.jsx
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AuthProvider } from '../providers/AuthProvider';
import { PermissionsProvider } from '../providers/PermissionsProvider';
import ProtectedRoute from './ProtectedRoute';
import Login from '../../modules/auth/pages/Login';

// Layout Imports
import AdminLayout from '../../shared/layouts/AdminLayout';

// Projects Imports
import ProjectListPage from '../../modules/projects/pages/ProjectListPage';

// Inventory Imports
import InventoryPage from '../../modules/inventory/pages/InventoryPage';
import InventoryListPage from '../../modules/inventory/pages/InventoryListPage';
import MaterialDetailsPage from '../../modules/inventory/pages/MaterialDetailsPage';
import EquipmentDetailsPage from '../../modules/inventory/pages/EquipmentDetailsPage';
import InventoryHistoryPage from '../../modules/inventory/pages/InventoryHistoryPage';

// Purchase Order Imports
import PurchaseOrderListPage from '../../modules/inventory/pages/PurchaseOrderListPage';

// Material Request Imports
import MaterialRequestListPage from '../../modules/inventory/pages/MaterialRequestListPage';
import MaterialRequestDetailsPage from '../../modules/inventory/pages/MaterialRequestDetailsPage';

// Dummy Super Admin Dashboard
const SuperAdminDashboard = () => {
    const navigate = useNavigate();
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-white">
            <h1 className="text-4xl font-bold text-blue-400">Super Admin Dashboard</h1>
            <p className="mt-4 mb-8">You have ultimate access.</p>
            <div className="flex gap-4">
                <button onClick={() => navigate('/inventory')} className="px-6 py-3 bg-[#0f62fe] hover:bg-blue-600 text-white font-bold rounded-lg shadow-lg">
                    Go to Inventory Module 🚀
                </button>
                <button onClick={() => navigate('/projects')} className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-lg">
                    Manage Projects
                </button>
            </div>
        </div>
    );
};

const AppRouter = () => {
    return (
        <AuthProvider>
            <PermissionsProvider>
                <BrowserRouter>
                    <Routes>
                        <Route path="/" element={<Login />} />
                        
                        {/* 🔒 STRICTLY SUPER ADMIN ROUTES */}
                        <Route element={<ProtectedRoute allowedRoles={['SUPER_ADMIN']} />}>
                            <Route path="/superadmin/dashboard" element={<SuperAdminDashboard />} />
                        </Route>

                        {/* 🔒 ADMIN LAYOUT WRAPPER */}
                        <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'SUPER_ADMIN', 'COMPANY_ADMIN']} />}>
                            <Route element={<AdminLayout />}>
                                {/* Dashboard */}
                                <Route path="/admin/dashboard" element={<div className="p-8"><h1 className="text-2xl font-bold dark:text-white">Standard Admin Dashboard</h1></div>} />
                                
                                {/* Projects Module */}
                                <Route path="/projects" element={<ProjectListPage />} />
                                
                                {/* Inventory Module */}
                                <Route path="/inventory" element={<InventoryPage />} />
                                <Route path="/inventory/list" element={<InventoryListPage />} />
                                <Route path="/inventory/history" element={<InventoryHistoryPage />} />
                                
                                {/* Details Pages */}
                                <Route path="/inventory/material/:id" element={<MaterialDetailsPage />} />
                                <Route path="/inventory/equipment/:id" element={<EquipmentDetailsPage />} />
                                
                                {/* Purchase Orders */}
                                <Route path="/inventory/po" element={<PurchaseOrderListPage />} />

                                {/* Material Requests */}
                                <Route path="/inventory/requests" element={<MaterialRequestListPage />} />
                                <Route path="/inventory/requests/:id" element={<MaterialRequestDetailsPage />} />
                                
                            </Route>
                        </Route>

                        {/* Fallback Route */}
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </BrowserRouter>
            </PermissionsProvider>
        </AuthProvider>
    );
};

export default AppRouter;