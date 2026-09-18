import api from "@/lib/api";

export async function checkout(vendorId) {
  const res = await api.post(`/checkout/${vendorId}`);
  return res.data;
}

export async function initiatePayment(
  order_id,
  phone_number,
  method = "esewa",
) {
  const res = await api.post("/payment/initiate", {
    order_id,
    phone_number,
    method,
  });
  return res.data;
}

export async function verifyPayment(order_id, otp) {
  const res = await api.post("/payment/verify", { order_id, otp });
  return res.data;
}

export async function getMyOrders() {
  const res = await api.get("/checkout/orders/mine");
  return res.data;
}
