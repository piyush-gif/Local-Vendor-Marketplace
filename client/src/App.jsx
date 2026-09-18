import { Routes, Route, Navigate } from "react-router-dom";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Home from "@/pages/Home";
import VendorStore from "@/pages/VendorStore";
import ProductDetail from "@/pages/ProductDetail";
import CartPage from "@/pages/Cart";
import Checkout from "@/pages/Checkout";
import Orders from "@/pages/Orders";
import VendorDashboard from "@/pages/VendorDashboard";
import VendorProducts from "@/pages/VendorProducts";
import VendorProductForm from "@/pages/VendorProductForm";
import AdminDashboard from "@/pages/AdminDashboard";
import ProtectedRoute from "@/components/ProtectedRoute";
import BottomNav from "@/components/BottomNav";
import TopNav from "@/components/TopNav";
import { useAuthStore } from "@/store/authStore";

function RoleHome() {
  const { user } = useAuthStore();
  if (user?.role === "vendor")
    return <Navigate to="/vendor/dashboard" replace />;
  if (user?.role === "admin") return <Navigate to="/admin/dashboard" replace />;
  return <Home />;
}

function App() {
  return (
    <>
      <TopNav />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<RoleHome />} />
        <Route path="/vendor/:vendorId" element={<VendorStore />} />
        <Route path="/product/:productId" element={<ProductDetail />} />
        <Route
          path="/cart"
          element={
            <ProtectedRoute allowedRoles={["buyer"]}>
              <CartPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/checkout/:vendorId"
          element={
            <ProtectedRoute allowedRoles={["buyer"]}>
              <Checkout />
            </ProtectedRoute>
          }
        />
        <Route
          path="/orders"
          element={
            <ProtectedRoute allowedRoles={["buyer"]}>
              <Orders />
            </ProtectedRoute>
          }
        />

        <Route
          path="/vendor/dashboard"
          element={
            <ProtectedRoute allowedRoles={["vendor"]}>
              <VendorDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/vendor/products"
          element={
            <ProtectedRoute allowedRoles={["vendor"]}>
              <VendorProducts />
            </ProtectedRoute>
          }
        />
        <Route
          path="/vendor/products/new"
          element={
            <ProtectedRoute allowedRoles={["vendor"]}>
              <VendorProductForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/vendor/products/:productId/edit"
          element={
            <ProtectedRoute allowedRoles={["vendor"]}>
              <VendorProductForm />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
      <BottomNav />
    </>
  );
}

export default App;
