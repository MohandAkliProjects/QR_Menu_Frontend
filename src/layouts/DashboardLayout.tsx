import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Menu } from "lucide-react";
import Sidebar from "../components/layout/Sidebar";

function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden">

      <aside className="hidden md:flex h-full overflow-y-auto shrink-0 bg-primary-900 rounded-r-xl">
        <Sidebar />
      </aside>

      {sidebarOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/50 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 z-50 md:hidden">
            <Sidebar onClose={() => setSidebarOpen(false)} />
          </div>
        </>
      )}

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">

        <header className="md:hidden flex items-center gap-3 px-4 py-3 bg-primary-900 shrink-0">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="w-9 h-9 flex items-center justify-center rounded-lg text-cream-500 hover:bg-primary-700 transition-colors"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <span className="text-cream-500 font-semibold text-base">Dashboard</span>
        </header>

        <main className="flex-1 overflow-y-auto overflow-x-hidden bg-primary-50 flex flex-col pb-10 min-w-0">
          <Outlet />
        </main>

      </div>
    </div>
  );
}

export default DashboardLayout;