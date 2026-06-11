import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import DashboardLayout from "./layouts/DashboardLayout";
import ProtectedRoute from "./components/shared/ProtectedRoute";
import LoginPage from "./pages/admin/LoginPage";
import OverviewPage from "./pages/admin/OverviewPage";
import CategoriesPage from "./pages/admin/CategoriesPage";
import DishesPage from "./pages/admin/DishesPage";
import InformationPage from "./pages/admin/InformationPage";
import BannersPage from "./pages/admin/BannersPage";
import QrDisplayPage from "./pages/admin/QrDisplayPage";
import MenuPage from "./pages/admin/MenuPage";


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<OverviewPage />} />
            <Route path="categories" element={<CategoriesPage />} />
            <Route path="dishes" element={<DishesPage />} />
            <Route path="information" element={<InformationPage />} />
            <Route path="banners" element={<BannersPage />} />
            <Route path="qr" element={<QrDisplayPage />} />
            <Route path="menu" element={<MenuPage />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;