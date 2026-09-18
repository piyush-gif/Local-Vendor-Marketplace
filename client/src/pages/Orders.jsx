import { useEffect, useState } from "react";
import { getMyOrders } from "@/lib/orders";
import { Badge } from "@/components/ui/badge";

const statusColors = {
  pending: "bg-secondary text-secondary-foreground",
  paid: "bg-accent text-accent-foreground",
  fulfilled: "bg-primary text-primary-foreground",
  cancelled: "bg-destructive text-white",
};

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyOrders()
      .then(setOrders)
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return (
      <p className="p-4 text-muted-foreground text-sm">Loading orders...</p>
    );

  return (
    <div className="max-w-2xl mx-auto px-4 py-4 pb-20 space-y-3">
      <h1 className="font-heading text-xl font-semibold mb-2">Your orders</h1>
      {orders.length === 0 && (
        <p className="text-muted-foreground text-sm">No orders yet.</p>
      )}
      {orders.map((order) => (
        <div
          key={order.id}
          className="bg-card border border-border rounded-2xl p-4"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium text-sm">Order #{order.id}</span>
            <Badge className={statusColors[order.status]}>{order.status}</Badge>
          </div>
          <p className="text-sm text-muted-foreground mb-1">
            Vendor #{order.vendor_id}
          </p>
          <p className="font-semibold text-primary">Rs. {order.total}</p>
        </div>
      ))}
    </div>
  );
}
