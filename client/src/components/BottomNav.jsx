import { NavLink } from "react-router-dom";
import { Home, ShoppingCart, Package, User } from "lucide-react";

const items = [
  { to: "/", icon: Home, label: "Home" },
  { to: "/cart", icon: ShoppingCart, label: "Cart" },
  { to: "/orders", icon: Package, label: "Orders" },
  { to: "/profile", icon: User, label: "Profile" },
];

export default function BottomNav() {
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
          <Icon className="w-5 h-5" />
          {label}
        </NavLink>
      ))}
    </nav>
  );
}
