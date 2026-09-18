import { Link, NavLink } from "react-router-dom";
import {
  ShoppingCart,
  Package,
  LogOut,
  ChevronDown,
  Store,
  LayoutDashboard,
  Users,
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCartStore } from "@/store/cartStore";

import { useEffect } from "react";
export default function TopNav() {
  const { user, token, logout } = useAuthStore();
  const { count, refreshCount } = useCartStore();

  useEffect(() => {
    if (user?.role === "buyer") refreshCount();
  }, [user]);
  return (
    <nav className="flex items-center justify-between px-6 py-3 border-b border-border bg-card">
      <Link to="/" className="font-heading text-lg font-semibold text-primary">
        LocalMart
      </Link>

      <div className="flex items-center gap-6">
        {user?.role === "buyer" && (
          <>
            <NavLink
              to="/cart"
              className="hidden md:flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition relative"
            >
              <ShoppingCart className="w-4 h-4" />
              Cart
              {count > 0 && (
                <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                  {count}
                </span>
              )}
            </NavLink>
            <NavLink
              to="/orders"
              className="hidden md:flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition"
            >
              <Package className="w-4 h-4" /> Orders
            </NavLink>
          </>
        )}

        {user?.role === "vendor" && (
          <>
            <NavLink
              to="/vendor/dashboard"
              className="hidden md:flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition"
            >
              <LayoutDashboard className="w-4 h-4" /> Dashboard
            </NavLink>
            <NavLink
              to="/vendor/products"
              className="hidden md:flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition"
            >
              <Store className="w-4 h-4" /> Products
            </NavLink>
          </>
        )}

        {user?.role === "admin" && (
          <NavLink
            to="/admin/dashboard"
            className="hidden md:flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition"
          >
            <Users className="w-4 h-4" /> Dashboard
          </NavLink>
        )}

        {token ? (
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition outline-none">
              {user?.name} <ChevronDown className="w-3 h-3" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <div className="px-2 py-1.5">
                <p className="font-medium text-sm">{user?.name}</p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
                <p className="text-xs text-primary capitalize mt-1">
                  {user?.role}
                </p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout} className="text-destructive">
                <LogOut className="w-4 h-4 mr-2" /> Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Link to="/login" className="text-sm font-medium text-primary">
            Login
          </Link>
        )}
      </div>
    </nav>
  );
}
