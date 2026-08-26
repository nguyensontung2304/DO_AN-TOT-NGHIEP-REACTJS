import { useState } from "react";
import "./contact.scss";
import Map from "../../../components/map/map";

export default function Contact() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [sent, setSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();

    setSent(true);
    setForm({ name: "", email: "", phone: "", message: "" });

    console.log(form);
  };

  return (
    <div className="contact-page">
      {/* Hero */}
      <section className="contact-hero">
        <h1>Liên hệ với chúng tôi</h1>
        <p>Đội ngũ tư vấn sẵn sàng hỗ trợ bạn 7 ngày/tuần</p>
      </section>

      <div className="contact-inner">
        <div className="contact-layout">
          {/* Info */}
          <div className="contact-info">
            <h2>Thông tin liên hệ</h2>

            {[
              {
                icon: "📍",
                title: "Địa chỉ xưởng",
                text: "34/16 Đường Bắc Đẩu, Thành Phố Đà Nẵng",
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
                <span className="contact-info__icon">{item.icon}</span>
                <div>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </div>
              </div>
            ))}

            <div className="contact-socials">
              <a href="#" aria-label="Facebook">
                📘 Facebook
              </a>
              <a href="#" aria-label="Zalo">
                💬 Zalo
              </a>
              <a href="#" aria-label="Youtube">
                ▶️ Youtube
              </a>
            </div>
          </div>

          {/* Form */}
          <div className="contact-form-wrap">
            <h2>Gửi tin nhắn cho chúng tôi</h2>

            {sent ? (
              <div className="contact-success">
                <span>✅</span>
                <h3>Gửi thành công!</h3>
                <p>Chúng tôi sẽ phản hồi trong vòng 24 giờ. Cảm ơn bạn!</p>
                <button onClick={() => setSent(false)}>
                  Gửi tin nhắn khác
                </button>
              </div>
            ) : (
              <form className="contact-form" onSubmit={handleSubmit}>
                <div className="contact-form__row">
                  <div className="contact-form__group">
                    <label>Họ và tên *</label>
                    <input
                      value={form.name}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, name: e.target.value }))
                      }
                      placeholder="Nguyễn Văn A"
                      required
                    />
                  </div>
                  <div className="contact-form__group">
                    <label>Số điện thoại *</label>
                    <input
                      value={form.phone}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, phone: e.target.value }))
                      }
                      placeholder="0909 123 456"
                      required
                    />
                  </div>
                </div>

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

                <div className="contact-form__group">
                  <label>Nội dung *</label>
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

        {/* Map placeholder */}
        <div className="contact-map">
          <p>🗺️ K34/16 Đường Bắc Đẩu, Quận Hải Châu, Thành Phố Đà Nẵng</p>
          <div className="contact-map__placeholder">
            <Map />
          </div>
        </div>
      </div>
    </div>
  );
}
