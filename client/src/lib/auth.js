import api from "@/lib/api";

export async function registerUser({ name, email, password, role }) {
  const res = await api.post("/auth/register", { name, email, password, role });
  return res.data;
}

export async function loginUser({ email, password }) {
  const res = await api.post("/auth/login", { email, password });
  return res.data; // { access_token, token_type }
}
