import apiClient from "../../../api/apiClient";

export const getProfile = async () => {
  try {
    const res = await apiClient.get("/auth/profile");
    const user = res.data.data;

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      designation: user.designation,
      department: user.department,
      profilePicture: user.profilePicture,
      roleName: user.role?.name || "",
      companyName: user.company?.name || "",
      companyId: user.company?.id || user.companyId || null,
    };
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const updateProfile = async (payload) => {
  try {
    const res = await apiClient.put("/auth/profile", payload);
    return res.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const changePassword = async ({ currentPassword, newPassword }) => {
  try {
    const res = await apiClient.post("/auth/change-password", {
      currentPassword,
      newPassword,
    });
    return res.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};