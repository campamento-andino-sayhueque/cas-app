import api from "@/lib/api";

// This is a single user record from your API
interface UserData {
  id: number;
  name: string;
  email: string;
  age: number;
  city: string;
}

// This is the full shape of the API response
interface ApiResponse {
  message: string;
  data: UserData[];
  timestamp: string;
}

export const fetchData = async (): Promise<ApiResponse> => {
  const response = await api.get("/api/data");
  return response.data;
};
