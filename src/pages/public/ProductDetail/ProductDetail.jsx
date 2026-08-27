import { useEffect, useState } from "react";

import { useParams, Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";

import "./productDetail.scss";

export default function ProductDetail() {
  const { id } = useParams();

  const navigate = useNavigate();

  const [product, setProduct] = useState(null);

  const [related, setRelated] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [qty, setQty] = useState(1);

  const currentUser = useSelector((state) => state.user.currentUser);

  // ======================
  // LẤY CHI TIẾT SẢN PHẨM
  // ======================
  useEffect(() => {
    const getProductDetail = async () => {
      try {
        setLoading(true);

        setError("");

        // Lấy sản phẩm hiện tại
        const response = await axios.get(
          `http://localhost:5000/products/${id}`,
        );

        setProduct(response.data);

        // Lấy tất cả sản phẩm
        const productsResponse = await axios.get(
          "http://localhost:5000/products",
        );

        // Lọc sản phẩm liên quan
        const relatedProducts = productsResponse.data
          .filter(
            (item) =>
              item.category === response.data.category &&
              item.id !== response.data.id,
          )
          .slice(0, 4);

        setRelated(relatedProducts);
      } catch (error) {
        console.error("Lỗi lấy sản phẩm:", error);

        setError("Không thể tải thông tin sản phẩm");
      } finally {
        setLoading(false);
      }
    };

    getProductDetail();
  }, [id]);

  // ======================
  // THÊM VÀO GIỎ HÀNG
  // ======================
  const handleAddToCart = async () => {
    if (!currentUser?.id) {
      navigate("/login-user", {
        state: {
          from: `/products/${id}`,
        },
      });

      return false;
    }

    try {
      await axios.post("http://localhost:5000/cart", {
        userId: currentUser.id,
        productId: product.id,
        qty: qty,
      });

      window.dispatchEvent(new Event("cartUpdated"));

      return true;
    } catch (error) {
      console.error("Lỗi thêm giỏ hàng:", error.response?.data || error);

      return false;
    }
  };

  // ======================
  // MUA NGAY
  // ======================
  const handleBuyNow = async () => {
    const success = await handleAddToCart();

    if (success) {
      navigate("/cart");
    }
  };

  // ======================
  // LOADING
  // ======================
  if (loading) {
    return (
      <div className="pd-notfound">
        <span>⏳</span>

        <h2>Đang tải sản phẩm...</h2>
      </div>
    );
  }

  // ======================
  // NOT FOUND
  // ======================
  if (error || !product) {
    return (
      <div className="pd-notfound">
        <span>😕</span>

        <h2>Không tìm thấy sản phẩm</h2>

        <p>{error || "Sản phẩm này không tồn tại hoặc đã bị xóa."}</p>

        <Link to="/products" className="pd-btn pd-btn--primary">
          ← Xem tất cả sản phẩm
        </Link>
      </div>
    );
  }

  // ======================
  // GIẢM GIÁ
  // ======================
  const discount = product.old_price
    ? Math.round((1 - Number(product.price) / Number(product.old_price)) * 100)
    : null;

  return (
    <div className="pd-page">
      {/* Breadcrumb */}

      <div className="pd-breadcrumb">
        <div className="pd-breadcrumb__inner">
          <Link to="/">Trang chủ</Link>

          <span>›</span>

          <Link to="/products">Sản phẩm</Link>

          <span>›</span>

          <span>{product.category}</span>

          <span>›</span>

          <span className="pd-breadcrumb__current">{product.name}</span>
        </div>
      </div>

      {/* Main */}

      <div className="pd-main">
        {/* Gallery */}

        <div className="pd-gallery">
          <div className="pd-gallery__main">
            {product.badge && (
              <span className="pd-gallery__badge">{product.badge}</span>
            )}

            {discount && (
              <span className="pd-gallery__discount">-{discount}%</span>
            )}

            <div className="pd-gallery__emoji">{product.emoji}</div>
          </div>

          <p className="pd-gallery__hint">Hình ảnh minh họa</p>
        </div>

        {/* Info */}

        <div className="pd-info">
          <span className="pd-info__cat">{product.category}</span>

          <h1 className="pd-info__name">{product.name}</h1>

          {/* Giá */}

          <div className="pd-info__price-row">
            <strong className="pd-info__price">
              {Number(product.price).toLocaleString("vi-VN")}₫
            </strong>

            {product.old_price && (
              <>
                <s className="pd-info__old-price">
                  {Number(product.old_price).toLocaleString("vi-VN")}₫
                </s>

                <span className="pd-info__discount-tag">
                  Tiết kiệm{" "}
                  {(
                    Number(product.old_price) - Number(product.price)
                  ).toLocaleString("vi-VN")}
                  ₫
                </span>
              </>
            )}
          </div>

          {/* Mô tả */}

          <p className="pd-info__desc">
            {product.long_description || product.description}
          </p>

          {/* Thông số */}

          {product.specs && product.specs.length > 0 && (
            <div className="pd-specs">
              <h3 className="pd-specs__title">Thông số kỹ thuật</h3>

              <table className="pd-specs__table">
                <tbody>
                  {product.specs.map((spec) => (
                    <tr key={spec.id}>
                      <td className="pd-specs__key">{spec.spec_name}</td>

                      <td className="pd-specs__val">{spec.spec_value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Nguyên vật liệu */}

          {product.recipe && product.recipe.length > 0 && (
            <details className="pd-recipe">
              <summary>
                🔩 Nguyên vật liệu sản xuất ({product.recipe.length} loại)
              </summary>

              <ul className="pd-recipe__list">
                {product.recipe.map((item) => (
                  <li key={item.id}>
                    <span>{item.material_name}</span>

                    <strong>
                      {item.qty} {item.unit}
                    </strong>
                  </li>
                ))}
              </ul>
            </details>
          )}

          {/* Actions */}

          <div className="pd-actions">
            {/* Quantity */}

            <div className="pd-qty">
              <button
                onClick={() =>
                  setQty((currentQty) => Math.max(1, currentQty - 1))
                }
              >
                −
              </button>

              <span>{qty}</span>

              <button onClick={() => setQty((currentQty) => currentQty + 1)}>
                +
              </button>
            </div>

            {/* Thêm giỏ */}

            {currentUser ? (
              <button
                className="pd-btn pd-btn--primary pd-btn--add"
                onClick={handleAddToCart}
              >
                🛒 Thêm vào giỏ hàng
              </button>
            ) : (
              <Link
                to="/login-user"
                state={{
                  from: `/products/${product.id}`,
                }}
                className="pd-btn pd-btn--guest"
              >
                🔒 Đăng nhập để đặt hàng
              </Link>
            )}
          </div>

          {/* Mua ngay */}

          {currentUser && (
            <button className="pd-btn pd-btn--buy-now" onClick={handleBuyNow}>
              ⚡ Mua ngay
            </button>
          )}

          {/* Cam kết */}

          <div className="pd-guarantees">
            {[
              {
                icon: "🛡️",
                text: "Bảo hành chính hãng",
              },

              {
                icon: "🚚",
                text: "Giao hàng & lắp đặt miễn phí",
              },

              {
                icon: "🔄",
                text: "Đổi trả trong 7 ngày",
              },

              {
                icon: "📞",
                text: "Hỗ trợ 24/7",
              },
            ].map((guarantee) => (
              <div key={guarantee.text} className="pd-guarantees__item">
                <span>{guarantee.icon}</span>

                <p>{guarantee.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sản phẩm liên quan */}

      {related.length > 0 && (
        <div className="pd-related">
          <div className="pd-related__inner">
            <h2 className="pd-related__title">Sản phẩm cùng danh mục</h2>

            <div className="pd-related__grid">
              {related.map((item) => (
                <Link
                  to={`/products/${item.id}`}
                  key={item.id}
                  className="pd-related-card"
                >
                  {item.badge && (
                    <span className="pd-related-card__badge">{item.badge}</span>
                  )}

                  <div className="pd-related-card__img">{item.emoji}</div>

                  <div className="pd-related-card__body">
                    <span className="pd-related-card__cat">
                      {item.category}
                    </span>

                    <h3 className="pd-related-card__name">{item.name}</h3>

                    <div className="pd-related-card__price">
                      <strong>
                        {Number(item.price).toLocaleString("vi-VN")}₫
                      </strong>

                      {item.old_price && (
                        <s>{Number(item.old_price).toLocaleString("vi-VN")}₫</s>
                      )}
                    </div>

                    <span className="pd-related-card__link">
                      Xem chi tiết →
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
