import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  createProduct,
  updateProduct,
  getMyProducts,
} from "@/lib/vendorDashboard";

const CATEGORIES = [
  "groceries",
  "handicrafts",
  "clothing",
  "electronics",
  "home goods",
];

export default function VendorProductForm() {
  const { productId } = useParams();
  const isEdit = Boolean(productId);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    image_url: "",
    category: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isEdit) {
      getMyProducts().then((products) => {
        const p = products.find((p) => p.id === Number(productId));
        if (p)
          setForm({ ...p, price: String(p.price), stock: String(p.stock) });
      });
    }
  }, [productId, isEdit]);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function validate() {
    if (
      !form.name ||
      !form.description ||
      !form.price ||
      !form.stock ||
      !form.image_url ||
      !form.category
    ) {
      return "All fields are required";
    }
    if (Number(form.price) <= 0) return "Price must be greater than 0";
    if (Number(form.stock) < 0) return "Stock cannot be negative";
    return "";
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    setError("");
    setLoading(true);
    try {
      const payload = {
        ...form,
        price: Number(form.price),
        stock: Number(form.stock),
      };
      if (isEdit) {
        await updateProduct(productId, payload);
      } else {
        await createProduct(payload);
      }
      navigate("/vendor/products");
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to save product");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-6 pb-20">
      <h1 className="font-heading text-xl font-semibold mb-6">
        {isEdit ? "Edit product" : "Add new product"}
      </h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="name">Name *</Label>
          <Input
            id="name"
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="description">Description *</Label>
          <Textarea
            id="description"
            value={form.description}
            onChange={(e) => update("description", e.target.value)}
            required
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="price">Price (Rs.) *</Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              min="0.01"
              value={form.price}
              onChange={(e) => update("price", e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="stock">Stock *</Label>
            <Input
              id="stock"
              type="number"
              min="0"
              value={form.stock}
              onChange={(e) => update("stock", e.target.value)}
              required
            />
          </div>
        </div>
        <div>
          <Label htmlFor="image_url">Image URL *</Label>
          <Input
            id="image_url"
            value={form.image_url}
            onChange={(e) => update("image_url", e.target.value)}
            required
            placeholder="https://..."
          />
        </div>
        <div>
          <Label htmlFor="category">Category *</Label>
          <select
            id="category"
            value={form.category}
            onChange={(e) => update("category", e.target.value)}
            className="w-full border border-border rounded-md h-9 px-3 bg-background"
            required
          >
            <option value="">Select a category</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        {error && <p className="text-destructive text-sm">{error}</p>}
        <Button
          type="submit"
          className="w-full active:scale-95 transition"
          disabled={loading}
        >
          {loading ? "Saving..." : isEdit ? "Save changes" : "Add product"}
        </Button>
      </form>
    </div>
  );
}
