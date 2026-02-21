import axios from "axios";

export interface StaffPayload {
  username: string;
  email: string;
  enabled: boolean;
  credentials: Array<{
    type: string;
    value: string;
    temporary: boolean;
  }>;
}

export async function addStaff(payload: StaffPayload, group: string = "mygroup") {
  const url = `https://auth-central-production.up.railway.app/api/v1/users?group=${group}`;
  try {
    const response = await axios.post(url, payload);
    return response.data;
  } catch (error: any) {
    throw error.response?.data || error;
  }
}
