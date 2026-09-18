import api from "@/lib/api";

export async function getVendor(id) {
  const res = await api.get(`/vendors/${id}`);
  return res.data;
}
