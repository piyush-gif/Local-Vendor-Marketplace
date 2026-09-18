import api from "@/lib/api";

export async function getAllVendors() {
  const res = await api.get("/admin/vendors");
  return res.data;
}

export async function getAllUsers() {
  const res = await api.get("/admin/users");
  return res.data;
}

export async function approveVendor(id) {
  const res = await api.post(`/admin/vendors/${id}/approve`);
  return res.data;
}

export async function rejectVendor(id) {
  const res = await api.post(`/admin/vendors/${id}/reject`);
  return res.data;
}
