import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Minus, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getCarts, updateCartItem, removeCartItem } from "@/lib/cart";
import { getProduct } from "@/lib/products";

export default function CartPage() {
  const [carts, setCarts] = useState([]);
  const [productsById, setProductsById] = useState({});
  const [loading, setLoading] = useState(true);

  async function loadCarts() {
    setLoading(true);
    const data = await getCarts();
    setCarts(data);

    const ids = [
      ...new Set(data.flatMap((c) => c.items.map((i) => i.product_id))),
    ];
    const fetched = await Promise.all(ids.map((id) => getProduct(id)));
    const map = {};
    fetched.forEach((p) => (map[p.id] = p));
    setProductsById(map);
    setLoading(false);
  }

  useEffect(() => {
    loadCarts();
  }, []);

  async function handleQuantity(itemId, newQty) {
    if (newQty < 1) return;
    await updateCartItem(itemId, newQty);
    loadCarts();
  }

  async function handleRemove(itemId) {
    await removeCartItem(itemId);
    loadCarts();
  }

  if (loading)
    return <p className="p-4 text-muted-foreground text-sm">Loading cart...</p>;

  if (carts.length === 0) {
    return (
      <div className="p-6 text-center pb-20">
        <p className="text-muted-foreground">Your cart is empty.</p>
      </div>
    );
  }

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
            <p className="text-sm text-muted-foreground mb-2">
              Vendor #{cart.vendor_id}
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
                        onClick={() =>
                          handleQuantity(item.id, item.quantity - 1)
                        }
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
                        onClick={() =>
                          handleQuantity(item.id, item.quantity + 1)
                        }
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
