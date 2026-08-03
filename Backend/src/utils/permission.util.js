import prisma from '../config/database.js';

export const checkUserPermission = async (userId, companyId, permissionCode) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        role: {
          include: {
            rolePermissions: {
              include: {
                permission: true,
              },
            },
          },
        },
      },
    });

    if (!user) return false;

    // Super Admin and Company Admin generally have all permissions
    if (user.userType === 'SUPER_ADMIN' || user.userType === 'COMPANY_ADMIN') {
      return true;
    }

    // Ensure company matches if provided
    if (companyId && user.companyId !== companyId) {
      return false;
    }

    // Check role permissions
    if (user.role && user.role.rolePermissions) {
      const hasPermission = user.role.rolePermissions.some(
        (rp) =>
          rp.permission.code === permissionCode ||
          rp.permission.code === 'ALL_ACCESS' ||
          rp.permission.code === 'FULL_COMPANY_ACCESS'
      );
      return hasPermission;
    }

    return false;
  } catch (error) {
    console.error('Permission check error:', error);
    return false;
  }
};
