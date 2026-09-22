// src/app/router/ProtectedRoute.jsx
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../providers/AuthProvider'; 

const ProtectedRoute = ({ allowedRoles }) => {
    const { user, isLoading } = useAuth();

    // 1. Wait for loading to finish
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0f62fe]"></div>
            </div>
        );
    }

    // 2. If no user object exists at all, go to login
    if (!user) {
        console.warn("🛡️ ProtectedRoute: No user found. Redirecting to Login.");
        return <Navigate to="/" replace />;
    }

    // 3. SECURE ROLE EXTRACTION: Check all possible places the role might be stored
    const userRole = 
        user.userType || 
        user.role?.name || 
        user.data?.userType || 
        user.data?.role?.name;

    // DIAGNOSTIC LOG (Press F12 in your browser to see this!)
    console.log("🛡️ ProtectedRoute Check:", {
        currentUserRole: userRole,
        rolesAllowedHere: allowedRoles,
        fullUserObject: user
    });

    // 4. If there are allowed roles, check if the user has one of them
    if (allowedRoles && allowedRoles.length > 0) {
        // Convert everything to uppercase to prevent case-sensitive typos
        const upperAllowed = allowedRoles.map(role => role.toUpperCase());
        const upperUserRole = userRole ? userRole.toUpperCase() : '';

        if (!upperAllowed.includes(upperUserRole)) {
            console.error(`⛔ Access Denied: User role '${upperUserRole}' is not in allowed list [${upperAllowed.join(', ')}]`);
            
            // Redirect based on what they actually are
            if (upperUserRole === 'SUPER_ADMIN') {
                return <Navigate to="/superadmin/dashboard" replace />;
            }
            return <Navigate to="/admin/dashboard" replace />;
        }
    }

    // 5. Success! Render the page.
    console.log("✅ ProtectedRoute: Access Granted!");
    return <Outlet />;
};

export default ProtectedRoute;