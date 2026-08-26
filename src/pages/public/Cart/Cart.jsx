import { useEffect, useState, useCallback } from "react";

import { Link, useNavigate } from "react-router-dom";

import axios from "axios";

import "./cart.scss";

export default function Cart() {
  const navigate = useNavigate();

  const [cart, setCart] = useState([]);

  const [loading, setLoading] = useState(true);

  const [step, setStep] = useState("cart");

  const [form, setForm] = useState({
    note: "",
  });

  const [user, setUser] = useState(() =>
    JSON.parse(localStorage.getItem("user")),
  );

  const getCart = useCallback(async () => {
    if (!user?.id) {
      setCart([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const response = await axios.get(`http://localhost:5000/cart/${user.id}`);

      setCart(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Lỗi lấy giỏ hàng:", error);
      setCart([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    getCart();
  }, [getCart]);

  useEffect(() => {
    const handleCartUpdated = () => {
      getCart();
    };

    window.addEventListener("cartUpdated", handleCartUpdated);

    return () => {
      window.removeEventListener("cartUpdated", handleCartUpdated);
    };
  }, [getCart]);

  useEffect(() => {
    const handleUserChanged = () => {
      setUser(JSON.parse(localStorage.getItem("user")));
    };

    window.addEventListener("userChanged", handleUserChanged);

    return () => {
      window.removeEventListener("userChanged", handleUserChanged);
    };
  }, []);

  // ======================
  // TỔNG TIỀN
  // ======================
  const cartTotal = cart.reduce((total, item) => {
    return total + Number(item.price) * Number(item.qty);
  }, 0);

  // ======================
  // CẬP NHẬT SỐ LƯỢNG
  // ======================
  const updateCartQty = async (productId, newQty) => {
    try {
      if (newQty <= 0) {
        await removeFromCart(productId);
        return;
      }

      await axios.put("http://localhost:5000/cart", {
        userId: user.id,
        productId: productId,
        qty: newQty,
      });

      setCart((prevCart) =>
        prevCart.map((item) =>
          item.productId === productId
            ? {
                ...item,
                qty: newQty,
              }
            : item,
        ),
      );
    } catch (error) {
      console.error("Lỗi cập nhật số lượng:", error);
      alert("Không thể cập nhật số lượng");
    }
  };

  // ======================
  // XÓA SẢN PHẨM
  // ======================
  const removeFromCart = async (productId) => {
    try {
      await axios.delete(`http://localhost:5000/cart/${user.id}/${productId}`);

      setCart((prevCart) =>
        prevCart.filter((item) => item.productId !== productId),
      );
    } catch (error) {
      console.error("Lỗi xóa sản phẩm:", error);
      alert("Không thể xóa sản phẩm");
    }
  };

  // ======================
  // VALIDATE
  // ======================
  const validate = () => {
    if (!user) {
      navigate("/login-user", {
        state: {
          from: "/cart",
        },
      });

      return false;
    }

    return true;
  };

  // ======================
  // ĐẶT HÀNG
  // ======================
  const handleOrder = async () => {
    if (!validate()) {
      return;
    }

    try {
      await axios.post(`http://localhost:5000/orders`, {
        userId: user.id,

        name: user.name,

        phone: user.phone,

        address: user.address,

        note: form.note,

        cart,

        total: cartTotal,
      });

      setCart([]);

      setStep("success");
    } catch (error) {
      console.error("Lỗi đặt hàng:", error.response?.data || error);

      alert(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Đặt hàng thất bại",
      );
    }
  };

  // ======================
  // LOADING
  // ======================
  if (loading) {
    return (
      <div className="cart-page">
        <div className="cart-empty">
          <h2>Đang tải giỏ hàng...</h2>
        </div>
      </div>
    );
  }

  // ======================
  // GIỎ HÀNG TRỐNG
  // ======================
  if (cart.length === 0 && step !== "success") {
    return (
      <div className="cart-page">
        <div className="cart-empty">
          <span>🛒</span>

          <h2>Giỏ hàng trống</h2>

          <p>Bạn chưa thêm sản phẩm nào vào giỏ.</p>

          <Link to="/products" className="cart-btn cart-btn--primary">
            Khám phá sản phẩm
          </Link>
        </div>
      </div>
    );
  }

  // ======================
  // ĐẶT HÀNG THÀNH CÔNG
  // ======================
  if (step === "success") {
    return (
      <div className="cart-page">
        <div className="cart-success">
          <div className="cart-success__icon">🎉</div>

          <h2>Đặt hàng thành công!</h2>

          <p>
            Cảm ơn <strong>{user?.name}</strong>! Đơn hàng đã được ghi nhận.
          </p>

          <p className="cart-success__sub">
            Chúng tôi sẽ liên hệ qua <strong>{user?.phone}</strong> để xác nhận.
          </p>

          <div className="cart-success__btns">
            <Link to="/" className="cart-btn cart-btn--primary">
              Về trang chủ
            </Link>

            <Link to="/products" className="cart-btn cart-btn--outline">
              Tiếp tục mua sắm
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="cart-inner">
        {/* BREADCRUMB */}
        <div className="cart-breadcrumb">
          <Link to="/">Trang chủ</Link>

          <span>›</span>

          <span>Giỏ hàng</span>

          {step === "checkout" && (
            <>
              <span>›</span>

              <span>Thanh toán</span>
            </>
          )}
        </div>

        {/* STEPS */}
        <div className="cart-steps">
          <div
            className={`cart-steps__item ${
              step === "cart" ? "active" : "done"
            }`}
          >
            <span>1</span>
            Giỏ hàng
          </div>

          <div className="cart-steps__line" />

          <div
            className={`cart-steps__item ${
              step === "checkout" ? "active" : ""
            }`}
          >
            <span>2</span>
            Thông tin đặt hàng
          </div>

          <div className="cart-steps__line" />

          <div
            className={`cart-steps__item ${step === "success" ? "active" : ""}`}
          >
            <span>3</span>
            Xác nhận
          </div>
        </div>

        <div className="cart-layout">
          {/* MAIN */}
          <div className="cart-main">
            {/* GIỎ HÀNG */}
            {step === "cart" && (
              <>
                <h2 className="cart-section-title">
                  🛒 Giỏ hàng của bạn
                  <span className="cart-count">({cart.length} sản phẩm)</span>
                </h2>

                <div className="cart-items">
                  {cart.map((item) => (
                    <div key={item.productId} className="cart-item">
                      {/* IMAGE */}
                      <div className="cart-item__img">{item.emoji}</div>

                      {/* INFO */}
                      <div className="cart-item__info">
                        <h3>{item.name}</h3>

                        <p className="cart-item__price">
                          {Number(item.price).toLocaleString("vi-VN")}₫
                        </p>

                        {/* NGUYÊN VẬT LIỆU */}
                        {item.recipe && item.recipe.length > 0 && (
                          <details className="cart-item__recipe">
                            <summary>
                              Nguyên vật liệu cần ({item.recipe.length} loại)
                            </summary>

                            <ul>
                              {item.recipe.map((r, i) => (
                                <li key={i}>
                                  {r.materialName}:{" "}
                                  <strong>
                                    {r.qty * item.qty} {r.unit}
                                  </strong>
                                </li>
                              ))}
                            </ul>
                          </details>
                        )}
                      </div>

                      {/* ACTION */}
                      <div className="cart-item__actions">
                        {/* QUANTITY */}
                        <div className="cart-qty">
                          <button
                            onClick={() =>
                              updateCartQty(item.productId, item.qty - 1)
                            }
                          >
                            −
                          </button>

                          <span>{item.qty}</span>

                          <button
                            onClick={() =>
                              updateCartQty(item.productId, item.qty + 1)
                            }
                          >
                            +
                          </button>
                        </div>

                        {/* SUBTOTAL */}
                        <p className="cart-item__subtotal">
                          {(
                            Number(item.price) * Number(item.qty)
                          ).toLocaleString("vi-VN")}
                          ₫
                        </p>

                        {/* REMOVE */}
                        <button
                          className="cart-item__remove"
                          onClick={() => removeFromCart(item.productId)}
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <Link to="/products" className="cart-continue">
                  ← Tiếp tục mua sắm
                </Link>
              </>
            )}

            {/* CHECKOUT */}
            {step === "checkout" && (
              <>
                <h2 className="cart-section-title">📋 Thông tin đặt hàng</h2>

                <div className="checkout-form">
                  <div className="checkout-form__row">
                    <div className="checkout-form__group">
                      <label>Họ và tên: {user.name}</label>
                    </div>

                    <div className="checkout-form__group">
                      <label>Số điện thoại: {user.phone}</label>
                    </div>
                  </div>

                  <div className="checkout-form__group">
                    <label>Địa chỉ nhận hàng: {user.address}</label>
                  </div>

                  {/* NOTE */}
                  <div className="checkout-form__group">
                    <label>Ghi chú (không bắt buộc)</label>

                    <textarea
                      rows={3}
                      value={form.note}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          note: e.target.value,
                        })
                      }
                    />
                  </div>

                  {/* ORDER SUMMARY */}
                  <div className="checkout-order-summary">
                    <h3>Tóm tắt đơn hàng</h3>

                    {cart.map((item) => (
                      <div key={item.productId} className="checkout-order-row">
                        <span>
                          {item.emoji} {item.name} × {item.qty}
                        </span>

                        <span>
                          {(
                            Number(item.price) * Number(item.qty)
                          ).toLocaleString("vi-VN")}
                          ₫
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  className="cart-btn-back"
                  onClick={() => setStep("cart")}
                >
                  ← Quay lại giỏ hàng
                </button>
              </>
            )}
          </div>

          {/* SIDEBAR */}
          <aside className="cart-sidebar">
            <div className="cart-summary">
              <h3>Tổng đơn hàng</h3>

              <div className="cart-summary__rows">
                {cart.map((item) => (
                  <div key={item.productId} className="cart-summary__row">
                    <span>
                      {item.emoji} {item.name} × {item.qty}
                    </span>

                    <span>
                      {(Number(item.price) * Number(item.qty)).toLocaleString(
                        "vi-VN",
                      )}
                      ₫
                    </span>
                  </div>
                ))}
              </div>

              <div className="cart-summary__divider" />

              <div className="cart-summary__total">
                <span>Tổng cộng</span>

                <strong>{cartTotal.toLocaleString("vi-VN")}₫</strong>
              </div>

              <div className="cart-summary__note">
                🚚 Miễn phí giao hàng & lắp đặt trong 50km
                <br />
                🛡️ Bảo hành 5 năm chính hãng
              </div>

              {/* CART */}
              {step === "cart" && (
                <button
                  className="cart-btn cart-btn--primary cart-btn--full"
                  onClick={() => {
                    if (!user) {
                      navigate("/login-user", {
                        state: {
                          from: "/cart",
                        },
                      });

                      return;
                    }

                    setStep("checkout");
                  }}
                >
                  {user ? "Tiến hành đặt hàng →" : "🔒 Đăng nhập để đặt hàng"}
                </button>
              )}

              {/* CHECKOUT */}
              {step === "checkout" && (
                <button
                  className="cart-btn cart-btn--primary cart-btn--full"
                  onClick={handleOrder}
                >
                  ✅ Xác nhận đặt hàng
                </button>
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
