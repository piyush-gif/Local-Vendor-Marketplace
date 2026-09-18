import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getProduct } from "@/lib/products";
import { getVendor } from "@/lib/vendors";
import { addToCart } from "@/lib/cart";
import { useCartStore } from "@/store/cartStore";
export default function ProductDetail() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [vendor, setVendor] = useState(null);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const increment = useCartStore((s) => s.increment);
  useEffect(() => {
    getProduct(productId).then((p) => {
      setProduct(p);
      getVendor(p.vendor_id).then(setVendor);
    });
  }, [productId]);

  async function handleAdd() {
    setAdding(true);
    try {
      await addToCart(product.id, 1);
      increment(1);
      setAdded(true);
    } finally {
      setAdding(false);
    }
  }

  if (!product)
    return <p className="p-4 text-muted-foreground text-sm">Loading...</p>;

  return (
    <div className="max-w-2xl mx-auto px-4 py-4 pb-20">
      <div className="aspect-square md:aspect-auto md:h-80 bg-muted rounded-2xl overflow-hidden mb-4">
        {product.image_url && (
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        )}
      </div>

      <button
        onClick={() => navigate(`/vendor/${product.vendor_id}`)}
        className="text-sm text-primary font-medium mb-1"
      >
        {vendor?.shop_name || "Shop"}
      </button>
      <h1 className="font-heading text-xl font-semibold mb-1">
        {product.name}
      </h1>
      <p className="text-sm text-muted-foreground mb-3">
        {product.description}
      </p>
      <p className="text-2xl font-semibold text-primary mb-6">
        Rs. {product.price}
      </p>

      <Button
        className="w-full active:scale-95 transition"
        onClick={handleAdd}
        disabled={adding || added}
      >
        <ShoppingCart className="w-4 h-4 mr-2" />
        {added ? "Added to cart" : adding ? "Adding..." : "Add to cart"}
      </Button>
    </div>
  );
}
