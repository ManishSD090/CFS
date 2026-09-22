import { createContext, useContext } from 'react';
import { useAuth } from './AuthProvider';

const PermissionsContext = createContext();

export const usePermissions = () => useContext(PermissionsContext);

export const PermissionsProvider = ({ children }) => {
    const { user } = useAuth();

    // Check if the user's role matches the required roles for a page
    const hasRole = (allowedRoles) => {
        if (!user) return false;
        // If no specific roles are required, let them through
        if (!allowedRoles || allowedRoles.length === 0) return true; 
        
        // Example: user.userType from your backend is 'SUPER_ADMIN'
        return allowedRoles.includes(user.userType);
    };

    // Advanced: Check if user has specific button-level permissions
    const hasPermission = (permissionCode) => {
        if (!user || !user.role || !user.role.permissions) return false;
        
        // Super Admins automatically bypass all permission restrictions
        if (user.userType === 'SUPER_ADMIN') return true;
        
        return user.role.permissions.includes(permissionCode);
    };

    return (
        <PermissionsContext.Provider value={{ hasRole, hasPermission }}>
            {children}
        </PermissionsContext.Provider>
    );
};