import { Outlet } from "react-router-dom";
import Sidebar from "../components/layout/Sidebar";

function DashboardLayout() {
  return (
    <div className="flex h-screen overflow-hidden">

      <aside className="h-full overflow-y-auto shrink-0 bg-primary-900 rounded-r-xl">
        <Sidebar />
      </aside>

      <main className="flex-1 overflow-y-auto overflow-x-hidden bg-primary-50 flex flex-col pb-10 min-w-0">
        <Outlet />
      </main>

    </div>
  );
}

export default DashboardLayout;