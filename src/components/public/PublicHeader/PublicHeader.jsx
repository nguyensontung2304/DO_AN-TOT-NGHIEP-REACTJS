import { useRef, useState, useEffect, useCallback } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import axios from "axios";

import "./publicHeader.scss";

export default function PublicHeader() {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user"));
    } catch {
      return null;
    }
  });

  const [cartCount, setCartCount] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [userDropdown, setUserDropdown] = useState(false);

  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // =====================================================
  // LẤY USER HIỆN TẠI
  // =====================================================
  const getCurrentUser = () => {
    try {
      return JSON.parse(localStorage.getItem("user"));
    } catch {
      return null;
    }
  };

  // =====================================================
  // LẤY SỐ LƯỢNG GIỎ HÀNG CỦA USER HIỆN TẠI
  // =====================================================
  const getCartCount = useCallback(async () => {
    const currentUser = getCurrentUser();

    // Không đăng nhập
    if (!currentUser?.id) {
      setCartCount(0);
      return;
    }

    try {
      const response = await axios.get(
        `http://localhost:5000/cart/${currentUser.id}`,
      );

      const cartData = Array.isArray(response.data) ? response.data : [];

      const totalQty = cartData.reduce((total, item) => {
        return total + Number(item.qty || 0);
      }, 0);

      setCartCount(totalQty);
    } catch (error) {
      console.error("Lỗi lấy số lượng giỏ hàng:", error);
      setCartCount(0);
    }
  }, []);

  // =====================================================
  // USER THAY ĐỔI
  // LOGIN / LOGOUT
  // =====================================================
  useEffect(() => {
    const handleUserChanged = () => {
      const currentUser = getCurrentUser();

      setUser(currentUser);

      // User thay đổi thì lấy lại cart của user mới
      getCartCount();
    };

    window.addEventListener("userChanged", handleUserChanged);

    return () => {
      window.removeEventListener("userChanged", handleUserChanged);
    };
  }, [getCartCount]);

  // =====================================================
  // HEADER LOAD LẦN ĐẦU
  // =====================================================
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    getCartCount();
  }, [getCartCount]);

  // =====================================================
  // CART THAY ĐỔI
  // =====================================================
  useEffect(() => {
    const handleCartUpdated = () => {
      getCartCount();
    };

    window.addEventListener("cartUpdated", handleCartUpdated);

    return () => {
      window.removeEventListener("cartUpdated", handleCartUpdated);
    };
  }, [getCartCount]);

  // =====================================================
  // ĐÓNG DROPDOWN KHI CLICK RA NGOÀI
  // =====================================================
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setUserDropdown(false);
      }
    };

    document.addEventListener("mousedown", handler);

    return () => {
      document.removeEventListener("mousedown", handler);
    };
  }, []);

  // =====================================================
  // ĐĂNG XUẤT
  // =====================================================
  const handleLogout = () => {
    // Xóa user
    localStorage.removeItem("user");

    // Xóa user trên giao diện
    setUser(null);

    // Xóa số cart trên giao diện
    setCartCount(0);

    // Đóng dropdown
    setUserDropdown(false);

    // Báo cho toàn bộ app biết user đã thay đổi
    window.dispatchEvent(new Event("userChanged"));

    // Báo cart thay đổi
    window.dispatchEvent(new Event("cartUpdated"));

    // Về trang chủ
    navigate("/");
  };

  return (
    <header className="pub-header">
      <div className="pub-header__inner">
        {/* LOGO */}
        <Link to="/" className="pub-header__logo">
          <span>🛋️</span>

          <span>
            <strong>Nội Thất</strong>
            <em> Việt</em>
          </span>
        </Link>

        {/* NAVIGATION */}
        <nav className={`pub-header__nav ${menuOpen ? "open" : ""}`}>
          <NavLink to="/" end onClick={() => setMenuOpen(false)}>
            Trang chủ
          </NavLink>

          <NavLink to="/products" onClick={() => setMenuOpen(false)}>
            Sản phẩm
          </NavLink>

          <NavLink to="/about" onClick={() => setMenuOpen(false)}>
            Giới thiệu
          </NavLink>

          <NavLink to="/contact" onClick={() => setMenuOpen(false)}>
            Liên hệ
          </NavLink>
        </nav>

        {/* ACTIONS */}
        <div className="pub-header__actions">
          {/* CART */}
          <button
            className="pub-header__cart"
            aria-label={`Giỏ hàng (${cartCount})`}
            onClick={() => navigate("/cart")}
          >
            🛒
            {cartCount > 0 && (
              <span className="pub-header__cart-badge">{cartCount}</span>
            )}
          </button>

          {/* CHƯA ĐĂNG NHẬP */}
          {!user && (
            <Link to="/login-user" className="pub-header__login-btn">
              Đăng nhập
            </Link>
          )}

          {/* ĐÃ ĐĂNG NHẬP */}
          {user && (
            <div className="pub-header__user" ref={dropdownRef}>
              <button
                className="pub-header__user-btn"
                onClick={() => setUserDropdown((value) => !value)}
                aria-expanded={userDropdown}
              >
                <span className="pub-header__user-avatar">
                  {user.name?.charAt(0).toUpperCase()}
                </span>

                <span className="pub-header__user-name">{user.name}</span>

                <span className="pub-header__user-caret">▾</span>
              </button>

              {userDropdown && (
                <div className="pub-header__dropdown">
                  <div className="pub-header__dropdown-info">
                    <strong>{user.name}</strong>
                    <small>{user.email}</small>
                  </div>

                  <div className="pub-header__dropdown-divider" />

                  <button
                    className="pub-header__dropdown-item pub-header__dropdown-item--danger"
                    onClick={handleLogout}
                  >
                    🚪 Đăng xuất
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ADMIN */}
          <Link to="/login" className="pub-header__admin-btn" title="Quản trị">
            🏭
          </Link>

          {/* BURGER */}
          <button
            className="pub-header__burger"
            aria-label="Menu"
            onClick={() => setMenuOpen((value) => !value)}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </div>
    </header>
  );
}
