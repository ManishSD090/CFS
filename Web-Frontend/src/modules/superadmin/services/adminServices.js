import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api/v1';

// Helper function to get headers with the token
const getAuthHeaders = () => {
  const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export const fetchCompanies = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/super-admin/companies`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error('Failed to fetch companies');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching companies:', error);
    throw error;
  }
};

export const getSuperAdminStats = async()=>{
    try {
        const res = await axios.get(`${API_BASE_URL}/super-admin/dashboard/stats`,{
            headers: getAuthHeaders(),
        });
        return res.data;
    } catch (error) {
        console.error('Error fetching super admin stats:', error);
        throw error;
    }
}

export const createCompany = async (companyData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/companies/create`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(companyData),
    });
    if (!response.ok) {
      const errData = await response.json();
      throw new Error(errData.message || 'Failed to create company');
    }
    return await response.json();
  } catch (error) {
    console.error('Error creating company:', error);
    throw error;
  }
};

export const updateCompanyStatus = async (companyId, isActive) => {
  try {
    const response = await fetch(`${API_BASE_URL}/companies/${companyId}/status`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ isActive }),
    });
    if (!response.ok) {
      const errData = await response.json();
      throw new Error(errData.message || 'Failed to update company status');
    }
    return await response.json();
  } catch (error) {
    console.error('Error updating company status:', error);
    throw error;
  }
};

export const deleteCompany = async (companyId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/super-admin/companies/${companyId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      const errData = await response.json();
      throw new Error(errData.message || 'Failed to delete company');
    }
    return await response.json();
  } catch (error) {
    console.error('Error deleting company:', error);
    throw error;
  }
};

export const fetchCompanyDetails = async (companyId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/companies/${companyId}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error('Failed to fetch company details');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching company details:', error);
    throw error;
  }
};

export const updateCompany = async (companyId, updateData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/companies/${companyId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(updateData),
    });
    if (!response.ok) {
      const errData = await response.json();
      throw new Error(errData.message || 'Failed to update company');
    }
    return await response.json();
  } catch (error) {
    console.error('Error updating company:', error);
    throw error;
  }
};

export const getSuperAdminProfile = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/super-admin/profile`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error('Failed to fetch profile');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching super admin profile:', error);
    throw error;
  }
};

export const updateSuperAdminProfile = async (profileData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/super-admin/profile`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(profileData),
    });
    if (!response.ok) {
      const errData = await response.json();
      throw new Error(errData.message || 'Failed to update profile');
    }
    return await response.json();
  } catch (error) {
    console.error('Error updating super admin profile:', error);
    throw error;
  }
};

export const changeAdminPassword = async (passwordData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/change-password`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(passwordData),
    });
    if (!response.ok) {
      const errData = await response.json();
      throw new Error(errData.message || 'Failed to change password');
    }
    return await response.json();
  } catch (error) {
    console.error('Error changing admin password:', error);
    throw error;
  }
};

export const addCompanyAdmin = async (companyId, adminData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/companies/${companyId}/admins`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(adminData),
    });
    if (!response.ok) {
      const errData = await response.json();
      throw new Error(errData.message || 'Failed to add company admin');
    }
    return await response.json();
  } catch (error) {
    console.error('Error adding company admin:', error);
    throw error;
  }
};

export const updateCompanyAdmin = async (companyId, adminId, adminData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/companies/${companyId}/admins/${adminId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(adminData),
    });
    if (!response.ok) {
      const errData = await response.json();
      throw new Error(errData.message || 'Failed to update company admin');
    }
    return await response.json();
  } catch (error) {
    console.error('Error updating company admin:', error);
    throw error;
  }
};


