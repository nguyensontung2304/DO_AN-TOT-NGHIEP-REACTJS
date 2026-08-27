import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";
import "./home.scss";

// ── ProductCard ────────────────────────────────────────────────────────────────
// Hiển thị 1 sản phẩm trong grid, xử lý thêm giỏ hàng inline
function ProductCard({ product }) {
  const currentUser = useSelector((state) => state.user.currentUser);
  const [added, setAdded] = useState(false); // feedback tạm thời sau khi thêm

  // Thêm sản phẩm vào giỏ hàng
  const handleAdd = async () => {
    if (!currentUser?.id) {
      window.location.href = "/login-user";
      return;
    }
    try {
      await axios.post("http://localhost:5000/cart", {
        userId: currentUser.id,
        productId: product.id,
        qty: 1,
      });
      // Thông báo cho Header cập nhật badge giỏ hàng
      window.dispatchEvent(new Event("cartUpdated"));
      // Hiện trạng thái "Đã thêm" trong 1.8s rồi trở về bình thường
      setAdded(true);
      setTimeout(() => setAdded(false), 1800);
    } catch (err) {
      console.error("Lỗi thêm giỏ hàng:", err.response?.data || err);
    }
  };

  return (
    <div className="product-card">
      {/* Badge khuyến mãi (nếu có) */}
      {product.badge && (
        <span className="product-card__badge">{product.badge}</span>
      )}

      {/* Ảnh / emoji sản phẩm — click dẫn đến trang chi tiết */}
      <Link
        to={`/products/${product.id}`}
        className="product-card__img"
        aria-label={`Xem chi tiết ${product.name}`}
      >
        {product.emoji}
      </Link>

      <div className="product-card__body">
        {/* Danh mục */}
        <span className="product-card__cat">{product.category}</span>

        {/* Tên sản phẩm */}
        <h3 className="product-card__name">
          <Link to={`/products/${product.id}`}>{product.name}</Link>
        </h3>

        {/* Mô tả ngắn — clamp 2 dòng */}
        <p className="product-card__desc">{product.description}</p>

        {/* Giá + giá gốc + % giảm */}
        <div className="product-card__price">
          <strong>{Number(product.price).toLocaleString("vi-VN")}₫</strong>
          {product.old_price && (
            <>
              <s>{Number(product.old_price).toLocaleString("vi-VN")}₫</s>
              <span className="product-card__discount">
                -{Math.round((1 - Number(product.price) / Number(product.old_price)) * 100)}%
              </span>
            </>
          )}
        </div>

        {/* Nút hành động */}
        <div className="product-card__btns">
          <Link to={`/products/${product.id}`} className="product-card__detail-btn">
            Chi tiết
          </Link>

          {currentUser ? (
            // Đã đăng nhập → nút thêm giỏ hàng
            <button
              className={`product-card__btn ${added ? "product-card__btn--added" : ""}`}
              onClick={handleAdd}
            >
              {added ? "✅ Đã thêm!" : "🛒 Thêm giỏ"}
            </button>
          ) : (
            // Chưa đăng nhập → chuyển về trang đăng nhập
            <Link
              to="/login-user"
              className="product-card__btn product-card__btn--guest"
              state={{ from: "/" }}
            >
              🔒 Đăng nhập
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Home ───────────────────────────────────────────────────────────────────────
export default function Home() {
  // ── State ────────────────────────────────────────────────────────────────────
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeCategory, setActiveCategory] = useState("Tất cả");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("default");

  // ── Lấy danh sách sản phẩm từ API ────────────────────────────────────────
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await axios.get("http://localhost:5000/products");
        setProducts(res.data);
      } catch (err) {
        console.error("Lỗi lấy sản phẩm:", err);
        setError("Không thể tải danh sách sản phẩm");
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // ── Danh mục duy nhất từ data ─────────────────────────────────────────────
  const categories = [
    "Tất cả",
    ...new Set(products.map((p) => p.category).filter(Boolean)),
  ];

  // ── Lọc theo danh mục + tìm kiếm ────────────────────────────────────────
  let filtered = products.filter((p) => {
    const matchCat = activeCategory === "Tất cả" || p.category === activeCategory;
    const matchSearch =
      search.trim() === "" ||
      p.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.category?.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  // ── Sắp xếp ──────────────────────────────────────────────────────────────
  if (sortBy === "price-asc")
    filtered = [...filtered].sort((a, b) => Number(a.price) - Number(b.price));
  if (sortBy === "price-desc")
    filtered = [...filtered].sort((a, b) => Number(b.price) - Number(a.price));
  if (sortBy === "name")
    filtered = [...filtered].sort((a, b) => a.name.localeCompare(b.name, "vi"));

  return (
    <div className="home">
      {/* ── HERO ──────────────────────────────────────────────────────────── */}
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
            32 mẫu bàn, ghế, tủ, kệ, sofa được thiết kế tinh tế — chất lượng
            bền vững, giao hàng lắp đặt tận nhà.
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

        {/* 4 card visual bên phải */}
        <div className="home__hero-visual">
          {[
            { icon: "🛋️", label: "Sofa cao cấp" },
            { icon: "🪵", label: "Gỗ tự nhiên" },
            { icon: "🎨", label: "Thiết kế độc quyền" },
            { icon: "🚚", label: "Giao lắp tận nhà" },
          ].map((c) => (
            <div key={c.label} className="home__hero-card">
              <span>{c.icon}</span>
              <p>{c.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── STATS ─────────────────────────────────────────────────────────── */}
      <section className="home__stats">
        <div className="home__stats-inner">
          {[
            { value: "32+", label: "Mẫu sản phẩm" },
            { value: "10.000+", label: "Khách hàng hài lòng" },
            { value: "15 năm", label: "Kinh nghiệm" },
            { value: "100%", label: "Bảo hành chính hãng" },
          ].map((s) => (
            <div key={s.label} className="home__stat">
              <strong>{s.value}</strong>
              <span>{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── DANH SÁCH SẢN PHẨM ───────────────────────────────────────────── */}
      <section className="home__products-section" id="products">
        <div className="home__products-inner">
          <h2 className="home__section-title">Tất cả sản phẩm</h2>

          {/* Thanh tìm kiếm + sắp xếp */}
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

          {/* Tabs danh mục */}
          <div className="products-cats">
            {categories.map((cat) => {
              const count =
                cat === "Tất cả"
                  ? products.length
                  : products.filter((p) => p.category === cat).length;
              return (
                <button
                  key={cat}
                  className={`products-cat-btn ${activeCategory === cat ? "active" : ""}`}
                  onClick={() => setActiveCategory(cat)}
                >
                  {cat}
                  <span className="products-cat-count">{count}</span>
                </button>
              );
            })}
          </div>

          {/* Số kết quả */}
          {!loading && !error && (
            <p className="products-result-count">
              {filtered.length === products.length
                ? `Hiển thị ${products.length} sản phẩm`
                : `${filtered.length} sản phẩm${search ? ` cho "${search}"` : ""}`}
            </p>
          )}

          {/* Loading / lỗi / rỗng / grid */}
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
              {filtered.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── TẠI SAO CHỌN CHÚNG TÔI ───────────────────────────────────────── */}
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

      {/* ── CTA ───────────────────────────────────────────────────────────── */}
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
