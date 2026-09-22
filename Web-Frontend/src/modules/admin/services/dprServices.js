import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api/v1';

const getAuthHeaders = () => {
  const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export const fetchDPRsByProject = async (projectId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/dpr/project/${projectId}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error('Failed to fetch DPRs');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching DPRs:', error);
    throw error;
  }
};

export const getDPRById = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/dpr/${id}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      const errData = await response.json();
      throw new Error(errData.message || 'Failed to fetch DPR details');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching DPR details:', error);
    throw error;
  }
};

export const createDPR = async (dprData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/dpr`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(dprData),
    });
    if (!response.ok) {
      const errData = await response.json();
      throw new Error(errData.message || 'Failed to create DPR');
    }
    return await response.json();
  } catch (error) {
    console.error('Error creating DPR:', error);
    throw error;
  }
};

export const updateDPR = async (id, dprData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/dpr/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(dprData),
    });
    if (!response.ok) {
      const errData = await response.json();
      throw new Error(errData.message || 'Failed to update DPR');
    }
    return await response.json();
  } catch (error) {
    console.error('Error updating DPR:', error);
    throw error;
  }
};

export const deleteDPR = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/dpr/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      const errData = await response.json();
      throw new Error(errData.message || 'Failed to delete DPR');
    }
    return await response.json();
  } catch (error) {
    console.error('Error deleting DPR:', error);
    throw error;
  }
};

export const approveDPR = async (id, payload) => {
  try {
    const response = await fetch(`${API_BASE_URL}/dpr/${id}/approve`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload)
    });
    if (!response.ok) {
      const errData = await response.json();
      throw new Error(errData.message || 'Failed to approve DPR');
    }
    return await response.json();
  } catch (error) {
    console.error('Error approving DPR:', error);
    throw error;
  }
};
