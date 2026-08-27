import { useEffect, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";
import "./cart.scss";

export default function Cart() {
  const navigate = useNavigate();
  const currentUser = useSelector((state) => state.user.currentUser);

  // ── State ──────────────────────────────────────────────────────────────────
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState("cart"); // "cart" | "checkout" | "success"
  const [form, setForm] = useState({
    name: currentUser?.name || "",
    phone: currentUser?.phone || "",
    address: currentUser?.address || "",
    note: "",
  });

  // ── Helper cập nhật một field trong form ──────────────────────────────────
  const updateForm = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  // ── Đồng bộ thông tin user vào form khi user thay đổi ─────────────────────
  useEffect(() => {
    if (currentUser) {
      setForm((prev) => ({
        ...prev,
        name: currentUser.name || prev.name,
        phone: currentUser.phone || prev.phone,
        address: currentUser.address || prev.address,
      }));
    }
  }, [currentUser]);

  // ── Gọi API lấy giỏ hàng ──────────────────────────────────────────────────
  const getCart = useCallback(async () => {
    if (!currentUser?.id) {
      setCart([]);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const res = await axios.get(`http://localhost:5000/cart/${currentUser.id}`);
      setCart(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Lỗi lấy giỏ hàng:", err);
      setCart([]);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  // ── Lấy giỏ hàng khi vào trang ────────────────────────────────────────────
  useEffect(() => {
    getCart();
  }, [getCart]);

  // ── Lắng nghe sự kiện giỏ hàng thay đổi (từ trang khác) ──────────────────
  useEffect(() => {
    window.addEventListener("cartUpdated", getCart);
    return () => window.removeEventListener("cartUpdated", getCart);
  }, [getCart]);

  // ── Lắng nghe sự kiện user thay đổi (đăng nhập / đăng xuất) ──────────────
  useEffect(() => {
    window.addEventListener("userChanged", getCart);
    return () => window.removeEventListener("userChanged", getCart);
  }, [getCart]);

  // ── Tính tổng tiền ─────────────────────────────────────────────────────────
  const cartTotal = cart.reduce(
    (total, item) => total + Number(item.price) * Number(item.qty),
    0,
  );

  // ── Cập nhật số lượng sản phẩm ────────────────────────────────────────────
  const updateCartQty = async (productId, newQty) => {
    if (newQty <= 0) {
      await removeFromCart(productId);
      return;
    }
    try {
      await axios.put("http://localhost:5000/cart", {
        userId: currentUser.id,
        productId,
        qty: newQty,
      });
      setCart((prev) =>
        prev.map((item) =>
          item.productId === productId ? { ...item, qty: newQty } : item,
        ),
      );
    } catch (err) {
      console.error("Lỗi cập nhật số lượng:", err);
      alert("Không thể cập nhật số lượng");
    }
  };

  // ── Xóa sản phẩm khỏi giỏ ────────────────────────────────────────────────
  const removeFromCart = async (productId) => {
    try {
      await axios.delete(
        `http://localhost:5000/cart/${currentUser.id}/${productId}`,
      );
      setCart((prev) => prev.filter((item) => item.productId !== productId));
    } catch (err) {
      console.error("Lỗi xóa sản phẩm:", err);
      alert("Không thể xóa sản phẩm");
    }
  };

  // ── Đặt hàng ──────────────────────────────────────────────────────────────
  const handleOrder = async () => {
    // Chưa đăng nhập → chuyển sang trang đăng nhập
    if (!currentUser) {
      navigate("/login-user", { state: { from: "/cart" } });
      return;
    }
    try {
      await axios.post("http://localhost:5000/orders", {
        userId: currentUser.id,
        name: form.name,
        phone: form.phone,
        address: form.address,
        note: form.note,
        cart,
        total: cartTotal,
      });
      setCart([]);
      setStep("success");
    } catch (err) {
      console.error("Lỗi đặt hàng:", err.response?.data || err);
      alert(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Đặt hàng thất bại",
      );
    }
  };

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="cart-page">
        <div className="cart-empty">
          <span>⏳</span>
          <h2>Đang tải giỏ hàng...</h2>
        </div>
      </div>
    );
  }

  // ── Giỏ hàng trống ────────────────────────────────────────────────────────
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

  // ── Đặt hàng thành công ───────────────────────────────────────────────────
  if (step === "success") {
    return (
      <div className="cart-page">
        <div className="cart-success">
          <div className="cart-success__icon">🎉</div>
          <h2>Đặt hàng thành công!</h2>
          <p>
            Cảm ơn <strong>{form.name}</strong>! Đơn hàng đã được ghi nhận.
          </p>
          <p className="cart-success__sub">
            Chúng tôi sẽ liên hệ qua <strong>{form.phone}</strong> để xác nhận.
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

  // ── Giao diện chính ───────────────────────────────────────────────────────
  return (
    <div className="cart-page">
      <div className="cart-inner">
        {/* Breadcrumb */}
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

        {/* Thanh tiến trình 3 bước */}
        <div className="cart-steps">
          <div className={`cart-steps__item ${step === "cart" ? "active" : "done"}`}>
            <span>1</span>
            Giỏ hàng
          </div>
          <div className="cart-steps__line" />
          <div className={`cart-steps__item ${step === "checkout" ? "active" : ""}`}>
            <span>2</span>
            Thông tin đặt hàng
          </div>
          <div className="cart-steps__line" />
          <div className={`cart-steps__item ${step === "success" ? "active" : ""}`}>
            <span>3</span>
            Xác nhận
          </div>
        </div>

        {/* Layout chính: main + sidebar */}
        <div className="cart-layout">
          {/* ── MAIN ──────────────────────────────────────────────────────── */}
          <div className="cart-main">
            {/* BƯỚC 1: Xem giỏ hàng */}
            {step === "cart" && (
              <>
                <h2 className="cart-section-title">
                  🛒 Giỏ hàng của bạn
                  <span className="cart-count">({cart.length} sản phẩm)</span>
                </h2>

                <div className="cart-items">
                  {cart.map((item) => (
                    <div key={item.productId} className="cart-item">
                      {/* Ảnh/emoji sản phẩm */}
                      <div className="cart-item__img">{item.emoji}</div>

                      {/* Thông tin sản phẩm */}
                      <div className="cart-item__info">
                        <h3>{item.name}</h3>
                        <p className="cart-item__price">
                          {Number(item.price).toLocaleString("vi-VN")}₫
                        </p>

                        {/* Nguyên vật liệu — collapsible */}
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

                      {/* Điều chỉnh số lượng + xóa */}
                      <div className="cart-item__actions">
                        <div className="cart-qty">
                          <button onClick={() => updateCartQty(item.productId, item.qty - 1)}>
                            −
                          </button>
                          <span>{item.qty}</span>
                          <button onClick={() => updateCartQty(item.productId, item.qty + 1)}>
                            +
                          </button>
                        </div>
                        <p className="cart-item__subtotal">
                          {(Number(item.price) * Number(item.qty)).toLocaleString("vi-VN")}₫
                        </p>
                        <button
                          className="cart-item__remove"
                          onClick={() => removeFromCart(item.productId)}
                          aria-label="Xóa sản phẩm"
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

            {/* BƯỚC 2: Nhập thông tin đặt hàng */}
            {step === "checkout" && (
              <>
                <h2 className="cart-section-title">📋 Thông tin đặt hàng</h2>

                <div className="checkout-form">
                  {/* Họ tên + Số điện thoại */}
                  <div className="checkout-form__row">
                    <div className="checkout-form__group">
                      <label>Họ và tên</label>
                      <input
                        type="text"
                        value={form.name}
                        onChange={(e) => updateForm("name", e.target.value)}
                        placeholder="Nguyễn Văn A"
                        required
                      />
                    </div>
                    <div className="checkout-form__group">
                      <label>Số điện thoại</label>
                      <input
                        type="tel"
                        value={form.phone}
                        onChange={(e) => updateForm("phone", e.target.value)}
                        placeholder="Nhập số điện thoại"
                        required
                      />
                    </div>
                  </div>

                  {/* Địa chỉ */}
                  <div className="checkout-form__group">
                    <label>Địa chỉ nhận hàng</label>
                    <textarea
                      rows={3}
                      value={form.address}
                      onChange={(e) => updateForm("address", e.target.value)}
                      placeholder="Nhập địa chỉ nhận hàng"
                      required
                    />
                  </div>

                  {/* Ghi chú */}
                  <div className="checkout-form__group">
                    <label>Ghi chú (không bắt buộc)</label>
                    <textarea
                      rows={3}
                      value={form.note}
                      onChange={(e) => updateForm("note", e.target.value)}
                      placeholder="Yêu cầu đặc biệt, thời gian giao hàng..."
                    />
                  </div>

                  {/* Tóm tắt đơn hàng */}
                  <div className="checkout-order-summary">
                    <h3>Tóm tắt đơn hàng</h3>
                    {cart.map((item) => (
                      <div key={item.productId} className="checkout-order-row">
                        <span>
                          {item.emoji} {item.name} × {item.qty}
                        </span>
                        <span>
                          {(Number(item.price) * Number(item.qty)).toLocaleString("vi-VN")}₫
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <button className="cart-btn-back" onClick={() => setStep("cart")}>
                  ← Quay lại giỏ hàng
                </button>
              </>
            )}
          </div>

          {/* ── SIDEBAR: Tổng đơn hàng + nút đặt hàng ─────────────────────── */}
          <aside className="cart-sidebar">
            <div className="cart-summary">
              <h3>Tổng đơn hàng</h3>

              {/* Danh sách sản phẩm tóm gọn */}
              <div className="cart-summary__rows">
                {cart.map((item) => (
                  <div key={item.productId} className="cart-summary__row">
                    <span>
                      {item.emoji} {item.name} × {item.qty}
                    </span>
                    <span>
                      {(Number(item.price) * Number(item.qty)).toLocaleString("vi-VN")}₫
                    </span>
                  </div>
                ))}
              </div>

              <div className="cart-summary__divider" />

              {/* Tổng cộng */}
              <div className="cart-summary__total">
                <span>Tổng cộng</span>
                <strong>{cartTotal.toLocaleString("vi-VN")}₫</strong>
              </div>

              {/* Ưu đãi giao hàng */}
              <div className="cart-summary__note">
                🚚 Miễn phí giao hàng &amp; lắp đặt trong 50km
                <br />
                🛡️ Bảo hành 5 năm chính hãng
              </div>

              {/* Nút bước 1 → bước 2 */}
              {step === "cart" && (
                <button
                  className="cart-btn cart-btn--primary cart-btn--full"
                  onClick={() => {
                    if (!currentUser) {
                      navigate("/login-user", { state: { from: "/cart" } });
                      return;
                    }
                    setStep("checkout");
                  }}
                >
                  {currentUser ? "Tiến hành đặt hàng →" : "🔒 Đăng nhập để đặt hàng"}
                </button>
              )}

              {/* Nút xác nhận đặt hàng ở bước 2 */}
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
