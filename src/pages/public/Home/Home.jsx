import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

import "./home.scss";

// ── Product card ─────────────────────────────────────────────────────────────
function ProductCard({ product }) {
  const user = JSON.parse(localStorage.getItem("user"));

  const [added, setAdded] = useState(false);

  // ======================
  // THÊM VÀO GIỎ HÀNG
  // ======================
  const handleAdd = async () => {
    const user = JSON.parse(localStorage.getItem("user"));

    if (!user?.id) {
      window.location.href = "/login-user";
      return;
    }

    try {
      await axios.post("http://localhost:5000/cart", {
        userId: user.id,
        productId: product.id,
        qty: 1,
      });

      // Lấy lại giỏ hàng mới nhất
      window.dispatchEvent(new Event("cartUpdated"));

      setAdded(true);

      setTimeout(() => {
        setAdded(false);
      }, 1800);
    } catch (error) {
      console.error("Lỗi thêm giỏ hàng:", error.response?.data || error);
    }
  };

  return (
    <div className="product-card">
      {product.badge && (
        <span className="product-card__badge">{product.badge}</span>
      )}

      <Link
        to={`/products/${product.id}`}
        className="product-card__img"
        aria-label={`Xem chi tiết ${product.name}`}
      >
        {product.emoji}
      </Link>

      <div className="product-card__body">
        <span className="product-card__cat">{product.category}</span>

        <h3 className="product-card__name">
          <Link to={`/products/${product.id}`}>{product.name}</Link>
        </h3>

        <p className="product-card__desc">{product.description}</p>

        <div className="product-card__price">
          <strong>{Number(product.price).toLocaleString("vi-VN")}₫</strong>

          {product.old_price && (
            <s>{Number(product.old_price).toLocaleString("vi-VN")}₫</s>
          )}

          {product.old_price && (
            <span className="product-card__discount">
              -
              {Math.round(
                (1 - Number(product.price) / Number(product.old_price)) * 100,
              )}
              %
            </span>
          )}
        </div>

        <div className="product-card__btns">
          <Link
            to={`/products/${product.id}`}
            className="product-card__detail-btn"
          >
            Chi tiết
          </Link>

          {user ? (
            <button
              className={`product-card__btn ${
                added ? "product-card__btn--added" : ""
              }`}
              onClick={handleAdd}
            >
              {added ? "✅ Đã thêm!" : "🛒 Thêm giỏ"}
            </button>
          ) : (
            <Link
              to="/login-user"
              className="product-card__btn product-card__btn--guest"
              state={{
                from: "/",
              }}
            >
              🔒 Đăng nhập
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Home ─────────────────────────────────────────────────────────────────────
export default function Home() {
  const [products, setProducts] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [activeCategory, setActiveCategory] = useState("Tất cả");

  const [search, setSearch] = useState("");

  const [sortBy, setSortBy] = useState("default");

  // ======================
  // LẤY SẢN PHẨM
  // ======================
  useEffect(() => {
    const getProducts = async () => {
      try {
        setLoading(true);

        setError("");

        const response = await axios.get("http://localhost:5000/products");

        setProducts(response.data);
      } catch (error) {
        console.error("Lỗi lấy sản phẩm:", error);

        setError("Không thể tải danh sách sản phẩm");
      } finally {
        setLoading(false);
      }
    };

    getProducts();
  }, []);

  // ======================
  // CATEGORY
  // ======================
  const categories = [
    "Tất cả",
    ...new Set(products.map((product) => product.category).filter(Boolean)),
  ];

  // ======================
  // FILTER
  // ======================
  let filtered = products.filter((product) => {
    const matchCat =
      activeCategory === "Tất cả" || product.category === activeCategory;

    const matchSearch =
      search.trim() === "" ||
      product.name?.toLowerCase().includes(search.toLowerCase()) ||
      product.category?.toLowerCase().includes(search.toLowerCase());

    return matchCat && matchSearch;
  });

  // ======================
  // SORT
  // ======================
  if (sortBy === "price-asc") {
    filtered = [...filtered].sort((a, b) => Number(a.price) - Number(b.price));
  }

  if (sortBy === "price-desc") {
    filtered = [...filtered].sort((a, b) => Number(b.price) - Number(a.price));
  }

  if (sortBy === "name") {
    filtered = [...filtered].sort((a, b) => a.name.localeCompare(b.name, "vi"));
  }

  return (
    <div className="home">
      {/* HERO */}
      <section className="home__hero">
        <div className="home__hero-content">
          <span className="home__hero-tag">
            ✨ Nội thất cao cấp — trực tiếp từ xưởng
          </span>

          <h1>
            Không gian sống
            <br />
            <span>đẹp hơn mỗi ngày</span>
          </h1>

          <p>
            32 mẫu bàn, ghế, tủ, kệ, sofa được thiết kế tinh tế — chất lượng bền
            vững, giao hàng lắp đặt tận nhà.
          </p>

          <div className="home__hero-btns">
            <a href="#products" className="btn btn--primary">
              Xem sản phẩm
            </a>

            <Link to="/contact" className="btn btn--outline">
              Tư vấn miễn phí
            </Link>
          </div>
        </div>

        <div className="home__hero-visual">
          {[
            {
              icon: "🛋️",
              label: "Sofa cao cấp",
            },
            {
              icon: "🪵",
              label: "Gỗ tự nhiên",
            },
            {
              icon: "🎨",
              label: "Thiết kế độc quyền",
            },
            {
              icon: "🚚",
              label: "Giao lắp tận nhà",
            },
          ].map((c) => (
            <div key={c.label} className="home__hero-card">
              <span>{c.icon}</span>

              <p>{c.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* STATS */}
      <section className="home__stats">
        <div className="home__stats-inner">
          {[
            {
              value: "32+",
              label: "Mẫu sản phẩm",
            },
            {
              value: "10.000+",
              label: "Khách hàng hài lòng",
            },
            {
              value: "15 năm",
              label: "Kinh nghiệm",
            },
            {
              value: "100%",
              label: "Bảo hành chính hãng",
            },
          ].map((s) => (
            <div key={s.label} className="home__stat">
              <strong>{s.value}</strong>

              <span>{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* PRODUCTS */}
      <section className="home__products-section" id="products">
        <div className="home__products-inner">
          <h2 className="home__section-title">Tất cả sản phẩm</h2>

          {/* TOOLBAR */}
          <div className="products-toolbar">
            <div className="products-search">
              <span>🔍</span>

              <input
                type="text"
                placeholder="Tìm sản phẩm..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />

              {search && (
                <button onClick={() => setSearch("")} aria-label="Xóa tìm kiếm">
                  ✕
                </button>
              )}
            </div>

            <select
              className="products-sort"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="default">Sắp xếp mặc định</option>

              <option value="price-asc">Giá: Thấp → Cao</option>

              <option value="price-desc">Giá: Cao → Thấp</option>

              <option value="name">Tên A → Z</option>
            </select>
          </div>

          {/* CATEGORY */}
          <div className="products-cats">
            {categories.map((cat) => {
              const count =
                cat === "Tất cả"
                  ? products.length
                  : products.filter((product) => product.category === cat)
                      .length;

              return (
                <button
                  key={cat}
                  className={`products-cat-btn ${
                    activeCategory === cat ? "active" : ""
                  }`}
                  onClick={() => setActiveCategory(cat)}
                >
                  {cat}

                  <span className="products-cat-count">{count}</span>
                </button>
              );
            })}
          </div>

          {/* RESULT */}
          {!loading && !error && (
            <p className="products-result-count">
              {filtered.length === products.length
                ? `Hiển thị ${products.length} sản phẩm`
                : `${filtered.length} sản phẩm${
                    search ? ` cho "${search}"` : ""
                  }`}
            </p>
          )}

          {/* LOADING */}
          {loading ? (
            <div className="products-empty">
              <span>⏳</span>

              <p>Đang tải sản phẩm...</p>
            </div>
          ) : error ? (
            <div className="products-empty">
              <span>⚠️</span>

              <p>{error}</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="products-empty">
              <span>😕</span>

              <p>Không tìm thấy sản phẩm phù hợp.</p>

              <button
                className="btn btn--outline"
                onClick={() => {
                  setSearch("");
                  setActiveCategory("Tất cả");
                }}
              >
                Xóa bộ lọc
              </button>
            </div>
          ) : (
            <div className="products-grid">
              {filtered.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* WHY US */}
      <section className="home__features-section">
        <div className="home__products-inner">
          <h2 className="home__section-title">Tại sao chọn Nội Thất Việt?</h2>

          <div className="home__features">
            {[
              {
                icon: "🏆",
                title: "Chất lượng cao cấp",
                desc: "Nguyên liệu gỗ tự nhiên và kim loại cao cấp đạt tiêu chuẩn quốc tế.",
              },
              {
                icon: "💰",
                title: "Giá cả hợp lý",
                desc: "Trực tiếp từ xưởng sản xuất, không qua trung gian — tiết kiệm 20–40%.",
              },
              {
                icon: "🚚",
                title: "Giao hàng toàn quốc",
                desc: "Lắp đặt tận nhà miễn phí trong 50km từ TP. HCM.",
              },
              {
                icon: "🛡️",
                title: "Bảo hành 5 năm",
                desc: "Cam kết bảo hành chính hãng 5 năm cho tất cả sản phẩm.",
              },
            ].map((f) => (
              <div key={f.title} className="home__feature">
                <span>{f.icon}</span>

                <h3>{f.title}</h3>

                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}

      <section className="home__cta">
        <div className="home__cta-inner">
          <h2>Bạn cần tư vấn thiết kế nội thất?</h2>

          <p>Đội ngũ chuyên gia sẵn sàng hỗ trợ 7 ngày/tuần.</p>

          <Link to="/contact" className="btn btn--white">
            Liên hệ ngay
          </Link>
        </div>
      </section>
    </div>
  );
}
