import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import "./LoginUser.scss";

const API_BASE_URL = "http://localhost:5000";

export default function LoginUser() {
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || "/";

  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user?.id) {
      navigate(from, { replace: true });
    }
  }, [from, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await axios.post(`${API_BASE_URL}/users/login`, {
        email: form.email,
        password: form.password,
      });

      const user = response.data.user;

      console.log(user);

      localStorage.setItem("user", JSON.stringify(user));

      window.dispatchEvent(new Event("userChanged"));

      navigate(from, { replace: true });
    } catch (error) {
      setError(error.response?.data?.message || "Đăng nhập thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <button className="login-back" onClick={() => navigate("/")}>
          ← Về trang chủ
        </button>

        <div className="login-logo">
          <span className="login-logo-icon">🛋️</span>
          <h1>Nội Thất Việt</h1>
          <p>Đăng nhập để đặt hàng</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) =>
                setForm((f) => ({ ...f, email: e.target.value }))
              }
              placeholder="email@example.com"
              autoFocus
              required
            />
          </div>

          <div className="form-group">
            <label>Mật khẩu</label>
            <input
              type="password"
              value={form.password}
              onChange={(e) =>
                setForm((f) => ({ ...f, password: e.target.value }))
              }
              placeholder="Nhập mật khẩu"
              required
            />
          </div>

          {error && <p className="login-error">{error}</p>}

          <button className="login-btn" type="submit" disabled={loading}>
            {loading ? "Đang đăng nhập..." : "Đăng nhập"}
          </button>
        </form>

        <p className="login-switch">
          Chưa có tài khoản? <Link to="/register">Đăng ký miễn phí</Link>
        </p>

        <div className="login-divider">
          <span>hoặc</span>
        </div>

        <Link to="/login" className="login-admin-link">
          🏭 Đăng nhập quản trị (Admin)
        </Link>

        <p className="login-hint">
          Demo: <strong>demo@email.com</strong> / <strong>demo123</strong>
        </p>
      </div>
    </div>
  );
}
