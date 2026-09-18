import { Link, NavLink } from "react-router-dom";
import { ShoppingCart, Package, LogOut } from "lucide-react";
import { useAuthStore } from "@/store/authStore";

export default function TopNav() {
  const { user, token, logout } = useAuthStore();

  return (
    <nav className="hidden md:flex items-center justify-between px-6 py-3 border-b border-border bg-card">
      <Link to="/" className="font-heading text-lg font-semibold text-primary">
        LocalMart
      </Link>

      <div className="flex items-center gap-6">
        <NavLink
          to="/cart"
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition"
        >
          <ShoppingCart className="w-4 h-4" /> Cart
        </NavLink>
        <NavLink
          to="/orders"
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition"
        >
          <Package className="w-4 h-4" /> Orders
        </NavLink>

        {token ? (
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">{user?.name}</span>
            <button
              onClick={logout}
              className="text-muted-foreground hover:text-destructive transition"
              title="Log out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <Link to="/login" className="text-sm font-medium text-primary">
            Login
          </Link>
        )}
      </div>
    </nav>
  );
}
