import { NavLink, useNavigate } from "react-router-dom";
import logo from "../../assets/Logo.svg";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../i18n/useLanguage";
import LanguageToggle from "../ui/sidebar/LanguageToggle";
import { sidebarText } from "./sidebar.text";
import {
  LayoutDashboard,
  LayoutGrid,
  UtensilsCrossed,
  BookOpen,
  Image,
  QrCode,
  Info,
  LogOut,
} from "lucide-react";

const linkConfig = [
  { to: "/dashboard", key: "overview" as const, icon: LayoutDashboard, end: true },
  { to: "/dashboard/categories", key: "categories" as const, icon: LayoutGrid, end: false },
  { to: "/dashboard/dishes", key: "dishes" as const, icon: UtensilsCrossed, end: false },
  { to: "/dashboard/menu", key: "menu" as const, icon: BookOpen, end: false },
  { to: "/dashboard/banners", key: "banners" as const, icon: Image, end: false },
  { to: "/dashboard/qr", key: "qrDisplay" as const, icon: QrCode, end: false },
  { to: "/dashboard/information", key: "information" as const, icon: Info, end: false },
];

interface SidebarProps {
  onClose?: () => void;
}

function Sidebar({ onClose }: SidebarProps) {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { language } = useLanguage();
  const t = sidebarText[language];

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <aside className="w-64 h-full bg-primary-900 flex flex-col px-4 py-6 rounded-r-xl overflow-hidden">
      <div className="flex flex-col items-center shrink-0 py-4">
        <img src={logo} alt="Spectral QR" className="w-48" />
      </div>

      <div className="shrink-0 h-px bg-primary-700 my-4" />

      <nav
        className="flex flex-col gap-2.5 flex-1 pt-2 overflow-y-auto"
        style={{ scrollbarWidth: "none" }}
      >
        {linkConfig.map(({ to, key, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={onClose}
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
            {t[key]}
          </NavLink>
        ))}
      </nav>

      <div className="shrink-0 h-px bg-primary-700 my-2" />

      <LanguageToggle />

      <button
        onClick={handleLogout}
        className="flex items-center gap-3 px-4 py-3.5 rounded-lg border border-danger-red
          bg-transparent text-danger-red font-sans text-base
          cursor-pointer w-full transition-all duration-200
          hover:bg-danger-red/10 active:bg-danger-red/20 mt-4 mb-2"
      >
        <LogOut className="w-5 h-5 text-danger-red shrink-0" />
        {t.logout}
      </button>
    </aside>
  );
}

export default Sidebar;