import { NavLink, useNavigate } from "react-router-dom";
import logo from "../../assets/Logo.svg";
import { useAuth } from "../../context/AuthContext";
import {
  DashboardIcon,
  CategoriesIcon,
  DishesIcon,
  MenuIcon,
  BannersIcon,
  QrCodeIcon,
  InformationIcon,
  LogoutIcon,
} from "../../assets/icons";

const links = [
  { to: "/dashboard", label: "Overview", icon: DashboardIcon, end: true },
  { to: "/dashboard/categories", label: "Categories", icon: CategoriesIcon, end: false },
  { to: "/dashboard/dishes", label: "Dishes", icon: DishesIcon, end: false },
  { to: "/dashboard/menu", label: "Menu", icon: MenuIcon, end: false },
  { to: "/dashboard/banners", label: "Banners", icon: BannersIcon, end: false },
  { to: "/dashboard/qr", label: "QR Display", icon: QrCodeIcon, end: false },
  { to: "/dashboard/information", label: "Information", icon: InformationIcon, end: false },
];

function Sidebar() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <aside className="w-64 h-full bg-primary-900 flex flex-col px-4 py-6 rounded-r-xl">

      {/* Logo */}
      <div className="flex flex-col items-center flex-shrink-0 py-4">
        <img src={logo} alt="Spectral QR" className="w-48" />
      </div>

      {/* Divider */}
      <div className="flex-shrink-0 h-px bg-primary-700 my-4" />

      {/* Nav Links */}
      <nav className="flex flex-col gap-2.5 flex-1 pt-2">
        {links.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3.5 rounded-[10px] no-underline
              font-sans text-base text-cream-500 transition-all duration-200
              ${isActive
                ? "bg-gold-600"
                : "bg-primary-700 hover:bg-primary-700/70 active:bg-gold-600"
              }`
            }
          >
            <Icon className="w-5 h-5 text-beige-600 shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <button
  onClick={handleLogout}
  className="flex items-center gap-3 px-4 py-3.5 rounded-lg border border-danger-red
    bg-transparent text-danger-red font-sans text-base
    cursor-pointer w-full transition-all duration-200
    hover:bg-danger-red/10 active:bg-danger-red/20 mt-4 mb-2"
>
  <LogoutIcon className="w-5 h-5 text-danger-red shrink-0" />
  Log out
</button>
    </aside>
  );
}

export default Sidebar;