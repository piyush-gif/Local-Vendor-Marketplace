import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Minus, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getCarts, updateCartItem, removeCartItem } from "@/lib/cart";
import { getProduct } from "@/lib/products";
import { getVendor } from "@/lib/vendors";
import { useCartStore } from "@/store/cartStore";
export default function CartPage() {
  const [carts, setCarts] = useState([]);
  const [productsById, setProductsById] = useState({});
  const [vendorsById, setVendorsById] = useState({});
  const [initialLoading, setInitialLoading] = useState(true);
  const refreshCount = useCartStore((s) => s.refreshCount);
  async function loadCarts() {
    const data = await getCarts();
    setCarts(data);

    const productIds = [
      ...new Set(data.flatMap((c) => c.items.map((i) => i.product_id))),
    ];
    const vendorIds = [...new Set(data.map((c) => c.vendor_id))];

    const [fetchedProducts, fetchedVendors] = await Promise.all([
      Promise.all(productIds.map((id) => getProduct(id))),
      Promise.all(vendorIds.map((id) => getVendor(id))),
    ]);

    setProductsById(Object.fromEntries(fetchedProducts.map((p) => [p.id, p])));
    setVendorsById(Object.fromEntries(fetchedVendors.map((v) => [v.id, v])));
  }

  useEffect(() => {
    loadCarts().finally(() => setInitialLoading(false));
  }, []);

  // Optimistic local update — no full page reload/loading flash
  function setLocalQuantity(cartId, itemId, newQty) {
    setCarts((prev) =>
      prev.map((c) =>
        c.id !== cartId
          ? c
          : {
              ...c,
              items: c.items.map((i) =>
                i.id === itemId ? { ...i, quantity: newQty } : i,
              ),
            },
      ),
    );
  }

  async function handleIncrement(cartId, item) {
    const newQty = item.quantity + 1;
    setLocalQuantity(cartId, item.id, newQty);
    await updateCartItem(item.id, newQty);
  }

  async function handleDecrement(cartId, item) {
    if (item.quantity <= 1) return; // can't go below 1 — use trash icon to remove instead
    const newQty = item.quantity - 1;
    setLocalQuantity(cartId, item.id, newQty);
    await updateCartItem(item.id, newQty);
  }

  async function handleRemove(itemId) {
    await removeCartItem(itemId);
    loadCarts(); // full refresh here is fine since a cart might disappear entirely
  }

  if (initialLoading)
    return <p className="p-4 text-muted-foreground text-sm">Loading cart...</p>;

  if (carts.length === 0) {
    return (
      <div className="p-6 text-center pb-20">
        <p className="text-muted-foreground">Your cart is empty.</p>
      </div>
    );
  }
  refreshCount();

  return (
    <div className="max-w-2xl mx-auto px-4 py-4 pb-20 space-y-6">
      <h1 className="font-heading text-xl font-semibold">Your carts</h1>
      {carts.map((cart) => {
        const total = cart.items.reduce((sum, i) => {
          const p = productsById[i.product_id];
          return sum + (p ? p.price * i.quantity : 0);
        }, 0);

        return (
          <div
            key={cart.id}
            className="bg-card border border-border rounded-2xl p-4"
          >
            <p className="text-sm text-primary font-medium mb-2">
              {vendorsById[cart.vendor_id]?.shop_name || "Shop"}
            </p>
            <div className="space-y-3">
              {cart.items.map((item) => {
                const product = productsById[item.product_id];
                if (!product) return null;
                return (
                  <div key={item.id} className="flex items-center gap-3">
                    <img
                      src={product.image_url}
                      className="w-14 h-14 rounded-lg object-cover bg-muted"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {product.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Rs. {product.price}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        size="icon"
                        variant="secondary"
                        className="w-7 h-7 active:scale-90 transition"
                        onClick={() => handleDecrement(cart.id, item)}
                        disabled={item.quantity <= 1}
                      >
                        <Minus className="w-3 h-3" />
                      </Button>
                      <span className="w-6 text-center text-sm">
                        {item.quantity}
                      </span>
                      <Button
                        size="icon"
                        variant="secondary"
                        className="w-7 h-7 active:scale-90 transition"
                        onClick={() => handleIncrement(cart.id, item)}
                      >
                        <Plus className="w-3 h-3" />
                      </Button>
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="active:scale-90 transition"
                      onClick={() => handleRemove(item.id)}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                );
              })}
            </div>
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
              <span className="font-semibold">
                Total: Rs. {total.toFixed(2)}
              </span>
              <Link to={`/checkout/${cart.vendor_id}`}>
                <Button className="active:scale-95 transition">Checkout</Button>
              </Link>
            </div>
          </div>
        );
      })}
    </div>
  );
}
