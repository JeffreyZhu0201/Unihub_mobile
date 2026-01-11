import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// For Android Emulator use 10.0.2.2, for iOS/Web use localhost
const API_BASE_URL = Platform.select({
  android: 'http://10.244.244.205:8080/api/v1',
  ios: 'http://10.244.244.205:8080/api/v1',
  default: 'http://10.244.244.205:8080/api/v1',
});

export interface UserProfile {
  ID: number;
  Nickname: string;
  Email: string;
  Role: { Key: string; Name: string };
  StudentNo?: string;
  DepartmentID?: number; // Add this
  CreatedAt?: string;
}

export interface Notification {
  ID: number;
  Title: string;
  Content: string;
  CreatedAt: string;
}

export interface LeaveRequest {
  ID: number;
  Type: string;
  Reason: string;
  StartTime: string;
  EndTime: string;
  Status: string;
  CreatedAt: string;
  AuditorID?: number;
}

export interface DingTask {
  ID: number;
  Title: string;
  StartTime: string;
  Deadline: string;
  Type: string;
}

export interface DingResponse {
  pending: DingTask[];
  complete: DingTask[];
}

const getHeaders = async () => {
  const token = await AsyncStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export const api = {
  // --- Auth ---
  login: async (email, password) => {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  register: async (payload) => {
    const res = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  // --- Profile ---
  getProfile: async (): Promise<UserProfile> => {
    const headers = await getHeaders();
    const res = await fetch(`${API_BASE_URL}/user/profile`, { headers });
    if (!res.ok) throw new Error('Failed to fetch profile');
    return res.json();
  },

  // --- Home Data ---
  getMyNotifications: async (): Promise<Notification[]> => {
    const headers = await getHeaders();
    const res = await fetch(`${API_BASE_URL}/notifications/mine`, { headers });
    if (!res.ok) throw new Error('Failed to fetch notifications');
    // Backend API logic from docs says returns array
    return res.json();
  },

  getMyDings: async (): Promise<DingTask[]> => {
    const headers = await getHeaders();
    const res = await fetch(`${API_BASE_URL}/dings/mydings`, { headers });
    if (!res.ok) throw new Error('Failed to fetch dings');
    return res.json();
  },

  // --- Leaves ---
  getMyLeaves: async (): Promise<LeaveRequest[]> => {
    const headers = await getHeaders();
    const res = await fetch(`${API_BASE_URL}/leaves/mine`, { headers });
    if (!res.ok) throw new Error('Failed to fetch leave history');
    return res.json();
  },

  // --- Actions ---
  joinClass: async (inviteCode: string) => {
    const headers = await getHeaders();
    const res = await fetch(`${API_BASE_URL}/classes/join`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ invite_code: inviteCode }),
    });
    // Check for both 200 OK or 201 Created depending on backend
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Join failed');
    }
    return res.json();
  },

  joinDept: async (inviteCode: string) => {
    const headers = await getHeaders();
    const res = await fetch(`${API_BASE_URL}/departments/join`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ invite_code: inviteCode }),
    });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Join failed');
    }
    return res.json();
  },

  applyLeave: async (payload: { type: string; start_time: string; end_time: string; reason: string }) => {
    const headers = await getHeaders();
    const res = await fetch(`${API_BASE_URL}/leaves`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Apply failed');
    return res.json();
  },
};