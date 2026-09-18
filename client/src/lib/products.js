import api from "@/lib/api";

export async function getProducts({ search, category, vendor_id } = {}) {
  const res = await api.get("/products", {
    params: { search, category, vendor_id },
  });
  return res.data;
}

export async function getProduct(id) {
  const res = await api.get(`/products/${id}`);
  return res.data;
}
