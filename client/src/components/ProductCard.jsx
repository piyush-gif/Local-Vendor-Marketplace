import { Link } from "react-router-dom";
import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { addToCart } from "@/lib/cart";
import { useState } from "react";

export default function ProductCard({ product }) {
  const [adding, setAdding] = useState(false);

  async function handleAdd(e) {
    e.preventDefault();
    setAdding(true);
    try {
      await addToCart(product.id, 1);
    } finally {
      setAdding(false);
    }
  }

  return (
    <Link
      to={`/product/${product.id}`}
      className="bg-card border border-border rounded-2xl overflow-hidden transition active:scale-95"
    >
      <div className="aspect-square bg-muted overflow-hidden">
        {product.image_url && (
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        )}
      </div>
      <div className="p-3">
        <h3 className="font-heading text-sm font-medium truncate">
          {product.name}
        </h3>
        <p className="text-xs text-muted-foreground truncate">
          {product.category}
        </p>
        <div className="flex items-center justify-between mt-2">
          <span className="font-semibold text-primary">
            Rs. {product.price}
          </span>
          <Button
            size="icon"
            variant="secondary"
            className="active:scale-90 transition"
            onClick={handleAdd}
            disabled={adding}
          >
            <ShoppingCart className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Link>
  );
}
