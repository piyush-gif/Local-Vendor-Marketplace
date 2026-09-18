import { NavLink } from "react-router-dom";
import {
  Home,
  ShoppingCart,
  Package,
  LayoutDashboard,
  Store,
  Users,
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { useEffect } from "react";
import { useCartStore } from "@/store/cartStore";
export default function BottomNav() {
  const { count, refreshCount } = useCartStore();

  const { user } = useAuthStore();

  let items = [{ to: "/", icon: Home, label: "Home" }];
  useEffect(() => {
    if (user?.role === "buyer") refreshCount();
  }, [user]);
  if (user?.role === "buyer") {
    items = [
      { to: "/", icon: Home, label: "Home" },
      { to: "/cart", icon: ShoppingCart, label: "Cart" },
      { to: "/orders", icon: Package, label: "Orders" },
    ];
  } else if (user?.role === "vendor") {
    items = [
      { to: "/vendor/dashboard", icon: LayoutDashboard, label: "Dashboard" },
      { to: "/vendor/products", icon: Store, label: "Products" },
    ];
  } else if (user?.role === "admin") {
    items = [{ to: "/admin/dashboard", icon: Users, label: "Dashboard" }];
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border flex justify-around py-2 md:hidden">
      {items.map(({ to, icon: Icon, label }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            `flex flex-col items-center text-xs gap-1 px-3 py-1 rounded-lg transition active:scale-90 ${
              isActive ? "text-primary" : "text-muted-foreground"
            }`
          }
        >
          <span className="relative">
            <Icon className="w-5 h-5" />
            {to === "/cart" && count > 0 && (
              <span className="absolute -top-1 -right-2 bg-primary text-primary-foreground text-[9px] w-3.5 h-3.5 rounded-full flex items-center justify-center">
                {count}
              </span>
            )}
          </span>
          {label}
        </NavLink>
      ))}
    </nav>
  );
}
