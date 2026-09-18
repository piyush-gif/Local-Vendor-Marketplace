import api from "@/lib/api";

export async function getMyVendorProfile() {
  const res = await api.get("/vendor/me");
  return res.data;
}

export async function getMyStats() {
  const res = await api.get("/vendor/stats");
  return res.data;
}

export async function getMyProducts() {
  const res = await api.get("/products/mine/list");
  return res.data;
}

export async function createProduct(data) {
  const res = await api.post("/products", data);
  return res.data;
}

export async function updateProduct(id, data) {
  const res = await api.put(`/products/${id}`, data);
  return res.data;
}

export async function deleteProduct(id) {
  const res = await api.delete(`/products/${id}`);
  return res.data;
}

export async function getMyVendorOrders() {
  const res = await api.get("/vendor/orders");
  return res.data;
}

export async function updateOrderStatus(orderId, status) {
  const res = await api.put(`/vendor/orders/${orderId}/status`, { status });
  return res.data;
}
