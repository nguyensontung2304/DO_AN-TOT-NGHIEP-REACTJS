import axios from "axios";
import { useEffect, useCallback } from "react";
import { useDispatch } from "react-redux";
import { setUser, clearUser } from "./redux/userSlice";

import { BrowserRouter, Routes, Route } from "react-router-dom";

// ====================
// PUBLIC LAYOUT
// ====================
import PublicLayout from "./layouts/public/PublicLayout";

// Public pages
import Home from "./pages/public/Home/Home";
import Products from "./pages/public/Products/Products";
import About from "./pages/public/About/About";
import Contact from "./pages/public/Contact/Contact";
import Cart from "./pages/public/Cart/Cart";
import LoginAdmin from "./pages/public/LoginAdmin/LoginAdmin";
import LoginUser from "./pages/public/LoginUser/LoginUser";
import Register from "./pages/public/Register/Register";
import ProductDetail from "./pages/public/ProductDetail/ProductDetail";
import Profile from "./pages/public/Profile/Profile";

// ====================
// ADMIN LAYOUT
// ====================
import AdminLayout from "./layouts/admin/AdminLayout";

// Admin pages
import Dashboard from "./pages/admin/Dashboard/Dashboard";
import Technical from "./pages/admin/Technical/Technical";
import Warehouse from "./pages/admin/Warehouse/Warehouse";
import Purchasing from "./pages/admin/Purchasing/Purchasing";
import Factory from "./pages/admin/Factory/Factory";
import FinishedGoods from "./pages/admin/FinishedGoods/FinishedGoods";

function App() {
  const dispatch = useDispatch();

  const getUser = useCallback(async () => {
    try {
      const userId = JSON.parse(localStorage.getItem("userId"));

      if (!userId) {
        dispatch(clearUser());
        return;
      }

      const response = await axios.get(
        `http://localhost:5000/users/login/${userId}`,
      );

      const user = response.data.user;

      dispatch(setUser(user));
    } catch (error) {
      console.log("Lỗi lấy thông tin user:", error);
      dispatch(clearUser());
    }
  }, [dispatch]);

  useEffect(() => {
    getUser();
  }, [getUser]);

  useEffect(() => {
    const handleUserChanged = () => {
      getUser();
    };

    window.addEventListener("userChanged", handleUserChanged);

    return () => {
      window.removeEventListener("userChanged", handleUserChanged);
    };
  }, [getUser]);

  return (
    <BrowserRouter>
      <Routes>
        {/* ==================== */}
        {/* PUBLIC */}
        {/* ==================== */}
        <Route
          path="/"
          element={
            <PublicLayout>
              <Home />
            </PublicLayout>
          }
        />

        <Route
          path="/products"
          element={
            <PublicLayout>
              <Products />
            </PublicLayout>
          }
        />

        <Route
          path="/about"
          element={
            <PublicLayout>
              <About />
            </PublicLayout>
          }
        />

        <Route
          path="/contact"
          element={
            <PublicLayout>
              <Contact />
            </PublicLayout>
          }
        />

        <Route
          path="/cart"
          element={
            <PublicLayout>
              <Cart />
            </PublicLayout>
          }
        />

        <Route
          path="/login"
          element={
            <PublicLayout>
              <LoginAdmin />
            </PublicLayout>
          }
        />

        <Route
          path="/login-user"
          element={
            <PublicLayout>
              <LoginUser />
            </PublicLayout>
          }
        />

        <Route
          path="/register"
          element={
            <PublicLayout>
              <Register />
            </PublicLayout>
          }
        />

        <Route
          path="/profile"
          element={
            <PublicLayout>
              <Profile />
            </PublicLayout>
          }
        />

        <Route
          path="/products/:id"
          element={
            <PublicLayout>
              <ProductDetail />
            </PublicLayout>
          }
        />

        {/* ==================== */}
        {/* ADMIN */}
        {/* ==================== */}
        <Route
          path="/admin"
          element={
            <AdminLayout>
              <Dashboard />
            </AdminLayout>
          }
        />

        <Route
          path="/admin/technical"
          element={
            <AdminLayout>
              <Technical />
            </AdminLayout>
          }
        />

        <Route
          path="/admin/warehouse"
          element={
            <AdminLayout>
              <Warehouse />
            </AdminLayout>
          }
        />

        <Route
          path="/admin/purchasing"
          element={
            <AdminLayout>
              <Purchasing />
            </AdminLayout>
          }
        />

        <Route
          path="/admin/factory"
          element={
            <AdminLayout>
              <Factory />
            </AdminLayout>
          }
        />

        <Route
          path="/admin/finished-goods"
          element={
            <AdminLayout>
              <FinishedGoods />
            </AdminLayout>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
