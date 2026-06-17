import { useAuthStore } from '../stores/authStore';

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export async function fetchApi(endpoint: string, options: RequestInit = {}) {
  const url = `${API_URL}${endpoint}`;
  
  const token = typeof window !== 'undefined' ? useAuthStore.getState().token : null;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const mergedHeaders = {
    ...headers,
    ...options.headers,
  };

  const response = await fetch(url, { ...options, headers: mergedHeaders });

  if (!response.ok) {
    let errorMsg = 'An error occurred while fetching the data.';
    try {
      const errorData = await response.json();
      errorMsg = errorData.message || errorMsg;
    } catch (e) {
      // Ignored
    }
    throw new Error(errorMsg);
  }

  // Handle empty responses (like 204 No Content)
  if (response.status === 204) return null;
  
  return response.json();
}
