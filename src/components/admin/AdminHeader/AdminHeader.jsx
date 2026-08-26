import { NavLink, useNavigate } from "react-router-dom";
import { useApp } from "../../../context/useApp";
import "./adminHeader.scss";

const NAV_ITEMS = [
  { to: "/admin",               label: "Dashboard",     icon: "📊" },
  { to: "/admin/technical",     label: "Kỹ thuật",      icon: "⚙️"  },
  { to: "/admin/warehouse",     label: "Thủ kho",       icon: "🏭"  },
  { to: "/admin/purchasing",    label: "Mua hàng",      icon: "🛒"  },
  { to: "/admin/factory",       label: "Nhà máy",       icon: "🔧"  },
  { to: "/admin/finished-goods",label: "Thành phẩm",    icon: "📦"  },
];

export default function AdminHeader() {
  const { logout, productionRequests, purchaseRequests, handoverOrders, designRequests } = useApp();
  const navigate = useNavigate();

  const pendingPR  = productionRequests.filter((r) => r.status === "pending").length;
  const pendingPurchase = purchaseRequests.filter((r) => r.status === "pending").length;
  const pendingHandover = handoverOrders.filter((o) => o.status === "pending").length;
  const pendingDesign   = designRequests.filter((r) => r.status === "pending").length;
  const totalAlerts = pendingPR + pendingPurchase + pendingHandover + pendingDesign;

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="admin-header">
      <div className="admin-header__top">
        <div className="admin-header__brand">
          <span>🏭</span>
          <div>
            <strong>Kho Xưởng ERP</strong>
            <small>Hệ thống quản lý sản xuất</small>
          </div>
        </div>

        <div className="admin-header__right">
          {totalAlerts > 0 && (
            <span className="admin-header__alert">
              🔔 {totalAlerts} thông báo chờ xử lý
            </span>
          )}

          <div className="admin-header__user">
            <span className="admin-header__avatar">👤</span>
            <span className="admin-header__username">Admin</span>
          </div>

          <button className="admin-header__logout" onClick={handleLogout}>
            Đăng xuất
          </button>
        </div>
      </div>

      <nav className="admin-header__nav">
        {NAV_ITEMS.map(({ to, label, icon }) => {
          // badge count per nav item
          let badge = 0;
          if (to === "/admin/warehouse") badge = pendingPR + pendingHandover;
          if (to === "/admin/purchasing") badge = pendingPurchase;
          if (to === "/admin/technical")  badge = pendingDesign;
          if (to === "/admin/factory")    badge = pendingHandover;

          return (
            <NavLink
              key={to}
              to={to}
              end={to === "/admin"}
              className={({ isActive }) =>
                `admin-header__nav-item ${isActive ? "active" : ""}`
              }
            >
              <span className="admin-header__nav-icon">{icon}</span>
              <span>{label}</span>
              {badge > 0 && (
                <span className="admin-header__nav-badge">{badge}</span>
              )}
            </NavLink>
          );
        })}
      </nav>
    </header>
  );
}
