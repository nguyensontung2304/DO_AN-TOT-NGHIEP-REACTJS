import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "../LoginUser/LoginUser.scss";

const API_BASE_URL = "http://localhost:5000";

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
    email: "",
    password: "",
    confirm: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    if (form.password !== form.confirm) {
      setError("Mật khẩu xác nhận không khớp.");
      return;
    }

    try {
      setLoading(true);

      const response = await axios.post(
        `${API_BASE_URL}/users/register`,
        {
          name: form.name,
          phone: form.phone,
          address: form.address,
          email: form.email,
          password: form.password,
        },
      );

      const user = response.data.user;

      localStorage.setItem("user", JSON.stringify(user));

      window.dispatchEvent(new Event("userChanged"));

      navigate("/login-user");
    } catch (error) {
      setError(error.response?.data?.message || "Đăng ký thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        {/* Back button */}
        <button className="login-back" onClick={() => navigate("/")}>
          ← Về trang chủ
        </button>

        <div className="login-logo">
          <span className="login-logo-icon">🛋️</span>
          <h1>Nội Thất Việt</h1>
          <p>Tạo tài khoản để đặt hàng</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Họ và tên</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="Nguyễn Sơn Tùng"
              autoFocus
              required
            />
          </div>

          <div className="form-group">
            <label>Số điện thoại</label>
            <input
              type="text"
              value={form.phone}
              onChange={(e) =>
                setForm((f) => ({ ...f, phone: e.target.value }))
              }
              placeholder="0795789458"
              required
            />
          </div>

          <div className="form-group">
            <label>Địa chỉ</label>
            <input
              type="text"
              value={form.address}
              onChange={(e) =>
                setForm((f) => ({ ...f, address: e.target.value }))
              }
              placeholder="K34/16 Đường Bắc Đẩu, Quận Hải Châu, Thành Phố Đà Nẵng "
              required
            />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) =>
                setForm((f) => ({ ...f, email: e.target.value }))
              }
              placeholder="sontung@gmail.com"
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
              placeholder="Ít nhất 6 ký tự"
              required
            />
          </div>

          <div className="form-group">
            <label>Xác nhận mật khẩu</label>
            <input
              type="password"
              value={form.confirm}
              onChange={(e) =>
                setForm((f) => ({ ...f, confirm: e.target.value }))
              }
              placeholder="Nhập lại mật khẩu"
              required
            />
          </div>

          {error && <p className="login-error">{error}</p>}

          <button className="login-btn" type="submit" disabled={loading}>
            {loading ? "Đang đăng ký..." : "Đăng ký"}
          </button>
        </form>

        <p className="login-switch">
          Đã có tài khoản? <Link to="/login-user">Đăng nhập ngay</Link>
        </p>
      </div>
    </div>
  );
}
