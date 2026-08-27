import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import "./contact.scss";
import Map from "../map/map";

export default function Contact() {
  const currentUser = useSelector((state) => state.user.currentUser);

  // ── Form state ─────────────────────────────────────────────────────────────
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    message: "",
  });
  const [sent, setSent] = useState(false);

  // ── Auto-fill thông tin user khi đăng nhập ─────────────────────────────────
  useEffect(() => {
    if (currentUser) {
      setForm((prev) => ({
        ...prev,
        name: currentUser.name || prev.name,
        phone: currentUser.phone || prev.phone,
        email: currentUser.email || prev.email,
      }));
    }
  }, [currentUser]);

  // ── Gửi form liên hệ ───────────────────────────────────────────────────────
  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: gọi API gửi tin nhắn khi backend sẵn sàng
    console.log("Gửi liên hệ:", form);
    setSent(true);
    setForm({ name: "", phone: "", email: "", message: "" });
  };

  return (
    <div className="contact-page">
      {/* ── HERO ────────────────────────────────────────────────────────────── */}
      <section className="contact-hero">
        <div className="contact-hero__inner">
          <span className="contact-hero__tag">📬 Hỗ trợ 7 ngày/tuần</span>
          <h1>Liên hệ với chúng tôi</h1>
          <p>Đội ngũ tư vấn sẵn sàng hỗ trợ bạn mọi lúc — hãy để lại tin nhắn!</p>
        </div>
      </section>

      <div className="contact-inner">
        <div className="contact-layout">
          {/* ── THÔNG TIN LIÊN HỆ ─────────────────────────────────────────── */}
          <div className="contact-info">
            <h2>Thông tin liên hệ</h2>

            {[
              {
                icon: "📍",
                title: "Địa chỉ xưởng",
                text: "34/16 Đường Bắc Đẩu\nThành Phố Đà Nẵng",
              },
              {
                icon: "📞",
                title: "Hotline",
                text: "0795 789 458\n(8h00 – 20h00 mỗi ngày)",
              },
              {
                icon: "✉️",
                title: "Email",
                text: "nguyensontung@gmail.com\nsupport@noithatviet.vn",
              },
              {
                icon: "🕐",
                title: "Giờ làm việc",
                text: "Thứ 2 – Thứ 7: 8h00 – 20h00\nChủ nhật: 9h00 – 17h00",
              },
            ].map((item) => (
              <div key={item.title} className="contact-info__item">
                <div className="contact-info__icon-wrap">
                  <span>{item.icon}</span>
                </div>
                <div>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </div>
              </div>
            ))}

            {/* Mạng xã hội */}
            <div className="contact-socials">
              <a href="#" aria-label="Facebook">📘 Facebook</a>
              <a href="#" aria-label="Zalo">💬 Zalo</a>
              <a href="#" aria-label="Youtube">▶️ Youtube</a>
            </div>
          </div>

          {/* ── FORM GỬI TIN NHẮN ─────────────────────────────────────────── */}
          <div className="contact-form-wrap">
            <h2>Gửi tin nhắn cho chúng tôi</h2>

            {/* Hiển thị banner khi đã đăng nhập */}
            {currentUser && !sent && (
              <div className="contact-user-banner">
                <span>👤</span>
                <span>
                  Xin chào <strong>{currentUser.name}</strong>! Thông tin của bạn đã được điền tự động.
                </span>
              </div>
            )}

            {sent ? (
              /* Trạng thái gửi thành công */
              <div className="contact-success">
                <div className="contact-success__icon">✅</div>
                <h3>Gửi thành công!</h3>
                <p>Chúng tôi sẽ phản hồi trong vòng 24 giờ. Cảm ơn bạn!</p>
                <button onClick={() => setSent(false)}>Gửi tin nhắn khác</button>
              </div>
            ) : (
              <form className="contact-form" onSubmit={handleSubmit}>
                {/* Họ tên + Điện thoại */}
                <div className="contact-form__row">
                  <div className="contact-form__group">
                    <label>
                      Họ và tên <span className="req">*</span>
                    </label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, name: e.target.value }))
                      }
                      placeholder="Nguyễn Văn A"
                      required
                    />
                  </div>
                  <div className="contact-form__group">
                    <label>
                      Số điện thoại <span className="req">*</span>
                    </label>
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, phone: e.target.value }))
                      }
                      placeholder="0909 123 456"
                      required
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="contact-form__group">
                  <label>Email</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, email: e.target.value }))
                    }
                    placeholder="email@example.com"
                  />
                </div>

                {/* Nội dung */}
                <div className="contact-form__group">
                  <label>
                    Nội dung <span className="req">*</span>
                  </label>
                  <textarea
                    rows={5}
                    value={form.message}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, message: e.target.value }))
                    }
                    placeholder="Bạn cần tư vấn về sản phẩm, báo giá, hay đặt lịch tham quan showroom?"
                    required
                  />
                </div>

                <button type="submit" className="contact-form__submit">
                  📤 Gửi tin nhắn
                </button>
              </form>
            )}
          </div>
        </div>

        {/* ── BẢN ĐỒ ────────────────────────────────────────────────────────── */}
        <div className="contact-map">
          <div className="contact-map__label">
            <span>🗺️</span>
            <span>K34/16 Đường Bắc Đẩu, Quận Hải Châu, Thành Phố Đà Nẵng</span>
          </div>
          <div className="contact-map__placeholder">
            <Map />
          </div>
        </div>
      </div>
    </div>
  );
}
