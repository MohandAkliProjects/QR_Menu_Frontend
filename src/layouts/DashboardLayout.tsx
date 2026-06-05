import { Outlet } from "react-router-dom";
import Sidebar from "../components/layout/Sidebar";

function DashboardLayout() {
  return (
    <div className="flex h-screen overflow-hidden">
      
      {/* Sidebar - fixed, never scrolls */}
      <aside className="h-screen overflow-y-auto shrink-0">
        <Sidebar />
      </aside>

      {/* Main content - scrolls independently */}
      <main className="flex-1 overflow-y-auto bg-primary-50 flex flex-col">
  <Outlet />
</main>

    </div>
  );
}

export default DashboardLayout;