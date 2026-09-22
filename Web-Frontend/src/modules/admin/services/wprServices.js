import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api/v1';

const getAuthHeaders = () => {
  const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export const fetchWPRsByProject = async (projectId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/wpr/list?projectId=${projectId}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error('Failed to fetch WPRs');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching WPRs:', error);
    throw error;
  }
};

export const getWeeklyPreview = async (projectId, startDate) => {
  try {
    // Determine end date (6 days after start date)
    const start = new Date(startDate);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);

    const response = await fetch(`${API_BASE_URL}/wpr?projectId=${projectId}&startDate=${start.toISOString()}&endDate=${end.toISOString()}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    
    if (!response.ok) {
      const errData = await response.json();
      throw new Error(errData.message || 'Failed to fetch WPR preview');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching WPR preview:', error);
    throw error;
  }
};

export const createWPR = async (wprData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/wpr`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(wprData),
    });
    if (!response.ok) {
      const errData = await response.json();
      throw new Error(errData.message || 'Failed to create WPR');
    }
    return await response.json();
  } catch (error) {
    console.error('Error creating WPR:', error);
    throw error;
  }
};

export const updateWPR = async (id, wprData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/wpr/${id}`, {
      method: 'PATCH', // Using PATCH as defined in wpr.routes.js
      headers: getAuthHeaders(),
      body: JSON.stringify(wprData),
    });
    if (!response.ok) {
      const errData = await response.json();
      throw new Error(errData.message || 'Failed to update WPR');
    }
    return await response.json();
  } catch (error) {
    console.error('Error updating WPR:', error);
    throw error;
  }
};
