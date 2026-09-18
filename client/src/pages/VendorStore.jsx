import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getProducts } from "@/lib/products";
import { getVendor } from "@/lib/vendors";
import ProductCard from "@/components/ProductCard";

export default function VendorStore() {
  const { vendorId } = useParams();
  const [products, setProducts] = useState([]);
  const [vendor, setVendor] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getProducts({ vendor_id: vendorId }), getVendor(vendorId)])
      .then(([prods, vend]) => {
        setProducts(prods);
        setVendor(vend);
      })
      .finally(() => setLoading(false));
  }, [vendorId]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-4 pb-20">
      <h1 className="font-heading text-xl font-semibold mb-4">
        {vendor?.shop_name || "Shop"}
      </h1>
      {loading ? (
        <p className="text-muted-foreground text-sm">Loading...</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
