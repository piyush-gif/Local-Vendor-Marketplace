import { useEffect, useState } from "react";
import {
  getMyStats,
  getMyVendorOrders,
  updateOrderStatus,
  getMyVendorProfile,
} from "@/lib/vendorDashboard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const statusColors = {
  pending: "bg-secondary text-secondary-foreground",
  paid: "bg-accent text-accent-foreground",
  fulfilled: "bg-primary text-primary-foreground",
  cancelled: "bg-destructive text-white",
};

export default function VendorDashboard() {
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  function load() {
    Promise.all([getMyVendorProfile(), getMyStats(), getMyVendorOrders()])
      .then(([p, s, o]) => {
        setProfile(p);
        setStats(s);
        setOrders(o);
      })
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function handleFulfill(orderId) {
    await updateOrderStatus(orderId, "fulfilled");
    load();
  }

  if (loading)
    return <p className="p-4 text-muted-foreground text-sm">Loading...</p>;

  if (profile?.status !== "approved") {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <h1 className="font-heading text-lg font-semibold mb-2">
          Pending approval
        </h1>
        <p className="text-muted-foreground text-sm">
          Your vendor account is waiting for admin approval before you can list
          products.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-4 pb-20">
      <h1 className="font-heading text-xl font-semibold mb-4">
        {profile?.shop_name}
      </h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Products", value: stats.total_products },
          { label: "Total orders", value: stats.total_orders },
          { label: "Awaiting fulfillment", value: stats.pending_orders },
          { label: "Fulfilled", value: stats.fulfilled_orders },
        ].map((s) => (
          <div
            key={s.label}
            className="bg-card border border-border rounded-2xl p-4"
          >
            <p className="text-2xl font-heading font-semibold text-primary">
              {s.value}
            </p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      <h2 className="font-heading text-lg font-semibold mb-3">Recent orders</h2>
      <div className="space-y-3">
        {orders.length === 0 && (
          <p className="text-muted-foreground text-sm">No orders yet.</p>
        )}
        {orders.map((o) => (
          <div
            key={o.id}
            className="bg-card border border-border rounded-2xl p-4 flex items-center justify-between"
          >
            <div>
              <p className="text-sm font-medium">Order #{o.id}</p>
              <p className="text-xs text-muted-foreground">Rs. {o.total}</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={statusColors[o.status]}>{o.status}</Badge>
              {o.status === "paid" && (
                <Button
                  size="sm"
                  className="active:scale-95 transition"
                  onClick={() => handleFulfill(o.id)}
                >
                  Mark fulfilled
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
