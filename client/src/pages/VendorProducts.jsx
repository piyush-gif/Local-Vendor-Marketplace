import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getMyProducts, deleteProduct } from "@/lib/vendorDashboard";

export default function VendorProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  function load() {
    getMyProducts()
      .then(setProducts)
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function handleDelete(id) {
    await deleteProduct(id);
    load();
  }

  if (loading)
    return <p className="p-4 text-muted-foreground text-sm">Loading...</p>;

  return (
    <div className="max-w-3xl mx-auto px-4 py-4 pb-20">
      <div className="flex items-center justify-between mb-4">
        <h1 className="font-heading text-xl font-semibold">Your products</h1>
        <Link to="/vendor/products/new">
          <Button className="active:scale-95 transition">
            <Plus className="w-4 h-4 mr-1" /> Add product
          </Button>
        </Link>
      </div>

      {products.length === 0 && (
        <p className="text-muted-foreground text-sm">No products yet.</p>
      )}

      <div className="space-y-3">
        {products.map((p) => (
          <div
            key={p.id}
            className="bg-card border border-border rounded-2xl p-3 flex items-center gap-3"
          >
            <img
              src={p.image_url}
              className="w-14 h-14 rounded-lg object-cover bg-muted"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{p.name}</p>
              <p className="text-xs text-muted-foreground">
                Rs. {p.price} · Stock: {p.stock}
              </p>
            </div>
            <Link to={`/vendor/products/${p.id}/edit`}>
              <Button
                size="icon"
                variant="secondary"
                className="active:scale-90 transition"
              >
                <Pencil className="w-4 h-4" />
              </Button>
            </Link>
            <Button
              size="icon"
              variant="ghost"
              className="active:scale-90 transition"
              onClick={() => handleDelete(p.id)}
            >
              <Trash2 className="w-4 h-4 text-destructive" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
