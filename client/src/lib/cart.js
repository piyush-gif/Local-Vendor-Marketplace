import api from "@/lib/api";

export async function getCarts() {
  const res = await api.get("/cart");
  return res.data;
}

export async function addToCart(product_id, quantity = 1) {
  const res = await api.post("/cart/add", { product_id, quantity });
  return res.data;
}

export async function updateCartItem(item_id, quantity) {
  const res = await api.put(`/cart/item/${item_id}`, { quantity });
  return res.data;
}

export async function removeCartItem(item_id) {
  const res = await api.delete(`/cart/item/${item_id}`);
  return res.data;
}
