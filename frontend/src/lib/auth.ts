import { api } from "./api";

export async function getCurrentUser() {
  try {
    const res = await api.get("/api/auth/me");
    return res.data;
  } catch {
    return null;
  }
}
