import { useEffect, useState } from "react";

import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";

import "./products.scss";

// ======================
// PRODUCT CARD
// ======================
function ProductCard({ product }) {
  const currentUser = useSelector((state) => state.user.currentUser);

  const [added, setAdded] = useState(false);

  // ======================
  // THÊM GIỎ HÀNG
  // ======================
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

      window.dispatchEvent(new Event("cartUpdated"));

      setAdded(true);

      setTimeout(() => {
        setAdded(false);
      }, 1800);
    } catch (error) {
      console.error("Lỗi thêm giỏ hàng:", error.response?.data || error);
    }
  };

  // ======================
  // GIẢM GIÁ
  // ======================
  const discount = product.old_price
    ? Math.round((1 - Number(product.price) / Number(product.old_price)) * 100)
    : null;

  return (
    <div className="product-card">
      {/* Badge */}

      {product.badge && (
        <span className="product-card__badge">{product.badge}</span>
      )}

      {/* Image */}

      <Link
        to={`/products/${product.id}`}
        className="product-card__img"
        aria-label={`Xem chi tiết ${product.name}`}
      >
        {product.emoji}
      </Link>

      {/* Body */}

      <div className="product-card__body">
        <span className="product-card__cat">{product.category}</span>

        <h3 className="product-card__name">
          <Link to={`/products/${product.id}`}>{product.name}</Link>
        </h3>

        <p className="product-card__desc">{product.description}</p>

        {/* Price */}

        <div className="product-card__price">
          <strong>{Number(product.price).toLocaleString("vi-VN")}₫</strong>

          {product.old_price && (
            <s>{Number(product.old_price).toLocaleString("vi-VN")}₫</s>
          )}

          {discount && (
            <span className="product-card__discount">-{discount}%</span>
          )}
        </div>

        {/* Buttons */}

        <div className="product-card__btns">
          <Link
            to={`/products/${product.id}`}
            className="product-card__detail-btn"
          >
            Chi tiết
          </Link>

          {currentUser ? (
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
              state={{
                from: "/products",
              }}
              className="product-card__btn product-card__btn--guest"
            >
              🔒 Đăng nhập
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

// ======================
// PRODUCTS PAGE
// ======================
export default function Products() {
  // ======================
  // DATA
  // ======================
  const [products, setProducts] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  // ======================
  // FILTER
  // ======================
  const [activeCategory, setActiveCategory] = useState("Tất cả");

  const [search, setSearch] = useState("");

  const [sortBy, setSortBy] = useState("default");

  // ======================
  // GET PRODUCTS
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
  let filtered = products.filter((item) => {
    const matchCategory =
      activeCategory === "Tất cả" || item.category === activeCategory;

    const matchSearch =
      search.trim() === "" ||
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.category?.toLowerCase().includes(search.toLowerCase());

    return matchCategory && matchSearch;
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

  // ======================
  // LOADING
  // ======================
  if (loading) {
    return (
      <div className="products-page">
        <div className="products-page__inner">
          <div className="products-empty">
            <span>⏳</span>

            <p>Đang tải sản phẩm...</p>
          </div>
        </div>
      </div>
    );
  }

  // ======================
  // ERROR
  // ======================
  if (error) {
    return (
      <div className="products-page">
        <div className="products-page__inner">
          <div className="products-empty">
            <span>😕</span>

            <p>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="products-page">
      {/* Hero */}

      <div className="products-page__hero">
        <h1>Tất cả sản phẩm</h1>

        <p>{products.length} mẫu nội thất chất lượng cao</p>
      </div>

      <div className="products-page__inner">
        {/* Toolbar */}

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
              <button onClick={() => setSearch("")} aria-label="Xóa">
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

        {/* Category */}

        <div className="products-cats">
          {categories.map((category) => {
            const count =
              category === "Tất cả"
                ? products.length
                : products.filter((product) => product.category === category)
                    .length;

            return (
              <button
                key={category}
                className={`products-cat-btn ${
                  activeCategory === category ? "active" : ""
                }`}
                onClick={() => setActiveCategory(category)}
              >
                {category}

                <span className="products-cat-count">{count}</span>
              </button>
            );
          })}
        </div>

        {/* Count */}

        <p className="products-result-count">
          {filtered.length === products.length
            ? `Hiển thị ${products.length} sản phẩm`
            : `${filtered.length} sản phẩm${search ? ` cho "${search}"` : ""}`}
        </p>

        {/* Empty */}

        {filtered.length === 0 ? (
          <div className="products-empty">
            <span>😕</span>

            <p>Không tìm thấy sản phẩm phù hợp.</p>

            <button
              className="btn-clear"
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
    </div>
  );
}
