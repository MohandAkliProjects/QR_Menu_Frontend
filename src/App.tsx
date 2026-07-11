import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import DashboardLayout from "./layouts/DashboardLayout";
import ProtectedRoute from "./components/shared/ProtectedRoute";
import { MenuProvider } from "./context/MenuContext";
import LoginPage from "./pages/admin/LoginPage";
import OverviewPage from "./pages/admin/OverviewPage";
import CategoriesPage from "./pages/admin/CategoriesPage";
import DishesPage from "./pages/admin/DishesPage";
import InformationPage from "./pages/admin/InformationPage";
import BannersPage from "./pages/admin/BannersPage";
import QrDisplayPage from "./pages/admin/QrDisplayPage";
import MenuPage from "./pages/admin/MenuPage";
import PublicMenuPage from "./pages/public/PublicMenuPage";
import LandingPage from "./pages/landing/LandingPage";
import SupplementsPage from "./pages/admin/SupplementsPage";


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/landingpage" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/menu/:menuId" element={<PublicMenuPage />} />
        <Route element={<ProtectedRoute />}>
          <Route
            path="/dashboard"
            element={
              <MenuProvider>
                <DashboardLayout />
              </MenuProvider>
            }
          >
            <Route index element={<OverviewPage />} />
            <Route path="categories" element={<CategoriesPage />} />
            <Route path="dishes" element={<DishesPage />} />
            <Route path="supplements" element={<SupplementsPage />} />
            <Route path="information" element={<InformationPage />} />
            <Route path="banners" element={<BannersPage />} />
            <Route path="qr" element={<QrDisplayPage />} />
            <Route path="menu" element={<MenuPage />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/landingpage" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;