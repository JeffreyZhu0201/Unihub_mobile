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
  DepartmentID?: number;
  Department?: Department; // 这里的 Department 可以保留，但我们主要使用新的接口返回
  CreatedAt?: string;
}

export interface OrgInfo {
  department?: Department;
  classes?: Class[];
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

  // 新增：获取详细组织信息
  getUserOrgInfo: async (): Promise<OrgInfo> => {
    const headers = await getHeaders();
    const res = await fetch(`${API_BASE_URL}/user/org_info`, { headers });
    if (!res.ok) throw new Error('Failed to fetch user org info');
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

  // --- Join Org ---
  joinClass: async (inviteCode: string) => {
    const headers = await getHeaders();
    const res = await fetch(`${API_BASE_URL}/classes/join`, {
        method: 'POST',
        headers,
        body: JSON.stringify({invite_code: inviteCode}),
    });
    if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || 'Failed to join class');
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
        // Backend returns JSON error usually, try to parse
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to join department');
    }
    return res.json();
  },

  // --- Leaves ---
  applyLeave: async (payload: { type: string; reason: string; startTime: string; endTime: string }) => {
    const headers = await getHeaders();
    const body = {
        type: payload.type,
        reason: payload.reason,
        start_time: payload.startTime,
        end_time: payload.endTime,
    };
    
    console.log("Applying leave:", body); // Debug log

    const res = await fetch(`${API_BASE_URL}/leaves`, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
    });

    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to apply leave');
    }
    return res.json();
  },

  getMyLeaves: async (): Promise<LeaveRequest[]> => {
    const headers = await getHeaders();
    const res = await fetch(`${API_BASE_URL}/leaves/mine`, { headers });
    if (!res.ok) throw new Error('Failed to fetch leave history');
    return res.json();
  },

  // --- Ding Actions ---
  // 调用后端 POST /dings/:dingId 接口
  performCheckIn: async (dingId: number) => {
    const headers = await getHeaders();
    // 假设路由配置为 POST /dings/:dingId
    const res = await fetch(`${API_BASE_URL}/dings/${dingId}`, {
      method: 'POST',
      headers,
    });
    
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Check-in failed');
    }
    return res.json();
  },
};