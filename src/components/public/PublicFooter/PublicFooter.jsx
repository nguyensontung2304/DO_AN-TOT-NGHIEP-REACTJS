import { Link } from "react-router-dom";
import "./publicFooter.scss";

export default function PublicFooter() {
  return (
    <footer className="pub-footer">
      <div className="pub-footer__inner">
        <div className="pub-footer__brand">
          <span className="pub-footer__logo">🛋️ Nội Thất Việt</span>
          <p>
            Chuyên cung cấp nội thất cao cấp —<br />
            bàn, ghế, tủ, kệ cho mọi không gian sống.
          </p>
          <div className="pub-footer__socials">
            <a href="#" aria-label="Facebook">
              📘
            </a>
            <a href="#" aria-label="Zalo">
              💬
            </a>
            <a href="#" aria-label="Youtube">
              ▶️
            </a>
          </div>
        </div>

        <div className="pub-footer__col">
          <h4>Sản phẩm</h4>
          <Link to="/products">Bàn ăn</Link>
          <Link to="/products">Ghế sofa</Link>
          <Link to="/products">Tủ quần áo</Link>
          <Link to="/products">Kệ sách</Link>
          <Link to="/products">Giường ngủ</Link>
        </div>

        <div className="pub-footer__col">
          <h4>Dịch vụ</h4>
          <a href="#">Thiết kế nội thất</a>
          <a href="#">Lắp đặt tại nhà</a>
          <a href="#">Bảo hành sản phẩm</a>
          <a href="#">Tư vấn miễn phí</a>
        </div>

        <div className="pub-footer__col">
          <h4>Liên hệ</h4>
          <p>📍 34/16 Đường Bắc Đẩu, Thành Phố Đà Nẵng</p>
          <p>📞 0795 789 458</p>
          <p>✉️ nguyensontung@gmail.com</p>
          <p>⏰ T2–T7: 8h00 – 20h00</p>
        </div>
      </div>

      <div className="pub-footer__bottom">
        <p>© 2026 Nội Thất Việt. Bảo lưu mọi quyền.</p>
      </div>
    </footer>
  );
}
