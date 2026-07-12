import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import logo from "../../assets/Logo.svg";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../i18n/useLanguage";
import LanguageToggle from "../ui/sidebar/LanguageToggle";
import { sidebarText } from "./Sidebar.text";
import {
  LayoutDashboard,
  LayoutGrid,
  UtensilsCrossed,
  BookOpen,
  Image,
  QrCode,
  Info,
  LogOut,
  PlusSquare,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";

const linkConfig = [
  { to: "/dashboard", key: "overview" as const, icon: LayoutDashboard, end: true },
  { to: "/dashboard/categories", key: "categories" as const, icon: LayoutGrid, end: false },
  { to: "/dashboard/dishes", key: "dishes" as const, icon: UtensilsCrossed, end: false },
  { to: "/dashboard/supplements", key: "supplements" as const, icon: PlusSquare, end: false }, // new
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

  // Desktop-only collapse state, persisted across sessions.
  // The `md:` prefixed classes below mean this state visually does nothing
  // below the md breakpoint — phones always render the original full drawer,
  // regardless of what `collapsed` is set to.
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("qresto:sidebarCollapsed") === "true";
  });

  const toggleCollapsed = () => {
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem("qresto:sidebarCollapsed", String(next));
      return next;
    });
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <aside
      className={`h-full bg-primary-900 flex flex-col py-6 rounded-r-xl overflow-hidden
        w-64 px-4 transition-[width] duration-300 ease-in-out
        ${collapsed ? "md:w-20 md:px-2" : ""}`}
    >
      {/* Collapse toggle — first thing at the top, desktop-only */}
      <div
        className={`hidden md:flex shrink-0 ${
          collapsed ? "justify-center" : "justify-end"
        }`}
      >
        <button
          onClick={toggleCollapsed}
          aria-label={collapsed ? t.expand : t.collapse}
          title={collapsed ? t.expand : t.collapse}
          className="flex items-center justify-center text-beige-600 hover:text-cream-500
            transition-colors p-1.5 rounded-md hover:bg-primary-700/60
            focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-600"
        >
          {collapsed ? (
            <PanelLeftOpen className="w-5 h-5" />
          ) : (
            <PanelLeftClose className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Logo — always full-size on mobile, hidden only on desktop when collapsed */}
      <div
        className={`flex items-center justify-center shrink-0 py-4 ${
          collapsed ? "md:hidden" : ""
        }`}
      >
        <img src={logo} alt="Spectral QR" className="w-40" />
      </div>

      <div className="shrink-0 h-px bg-primary-700 my-4" />

      <nav
        className="flex flex-col gap-2.5 flex-1 pt-2 overflow-y-auto"
        style={{ scrollbarWidth: "none" }}
      >
        {linkConfig.map(({ to, key, icon: Icon, end }) => (
          <div key={to} className="group relative">
            <NavLink
              to={to}
              end={end}
              onClick={onClose}
              title={collapsed ? t[key] : undefined}
              className={({ isActive }) =>
                `flex items-center gap-3 py-3.5 px-4 rounded-[10px] no-underline
                font-sans text-base text-cream-500 transition-all duration-200
                ${collapsed ? "md:justify-center md:px-0" : ""}
                ${isActive
                  ? "bg-gold-600"
                  : "bg-primary-700 hover:bg-primary-700/70 active:bg-gold-600"
                }`
              }
            >
              <Icon className="w-5 h-5 text-beige-600 shrink-0" />
              <span
                className={`whitespace-nowrap transition-all duration-200 w-auto opacity-100 ${
                  collapsed ? "md:w-0 md:opacity-0 md:overflow-hidden" : ""
                }`}
              >
                {t[key]}
              </span>
            </NavLink>

            {/* Tooltip — only relevant (and only shown) on desktop when collapsed */}
            {collapsed && (
              <span
                className="hidden md:block pointer-events-none absolute left-full top-1/2 z-20 ml-2 -translate-y-1/2
                  whitespace-nowrap rounded-md bg-primary-900 border border-primary-700 px-2 py-1
                  text-xs text-cream-500 opacity-0 shadow-lg transition-opacity duration-150
                  group-hover:opacity-100"
              >
                {t[key]}
              </span>
            )}
          </div>
        ))}
      </nav>

      <div className="shrink-0 h-px bg-primary-700 my-2" />

      <div className={collapsed ? "md:hidden" : ""}>
        <LanguageToggle />
      </div>

      <div className="group relative mt-4 mb-2">
        <button
          onClick={handleLogout}
          title={collapsed ? t.logout : undefined}
          className={`flex items-center gap-3 py-3.5 px-4 rounded-lg border border-danger-red
            bg-transparent text-danger-red font-sans text-base
            cursor-pointer w-full transition-all duration-200
            hover:bg-danger-red/10 active:bg-danger-red/20
            ${collapsed ? "md:justify-center md:px-0" : ""}`}
        >
          <LogOut className="w-5 h-5 text-danger-red shrink-0" />
          <span
            className={`whitespace-nowrap transition-all duration-200 w-auto opacity-100 ${
              collapsed ? "md:w-0 md:opacity-0 md:overflow-hidden" : ""
            }`}
          >
            {t.logout}
          </span>
        </button>

        {collapsed && (
          <span
            className="hidden md:block pointer-events-none absolute left-full top-1/2 z-20 ml-2 -translate-y-1/2
              whitespace-nowrap rounded-md bg-primary-900 border border-primary-700 px-2 py-1
              text-xs text-cream-500 opacity-0 shadow-lg transition-opacity duration-150
              group-hover:opacity-100"
          >
            {t.logout}
          </span>
        )}
      </div>
    </aside>
  );
}

export default Sidebar;