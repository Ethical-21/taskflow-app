import axios from 'axios';

const API_BASE_URL = "http://localhost:5000/api"; // Backend server URL

// Helper to get token from localStorage
const getAuthToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
};

export const fetchTasks = async () => {
  try {
    const token = getAuthToken();
    const response = await axios.get(`${API_BASE_URL}/tasks`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching tasks:", error);
    throw error;
  }
};

export const createTask = async (taskData) => {
  try {
    const token = getAuthToken();
    const response = await axios.post(`${API_BASE_URL}/tasks`, taskData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error creating task:", error);
    throw error;
  }
};

// Add other API functions as needed (updateTask, deleteTask, etc.)
