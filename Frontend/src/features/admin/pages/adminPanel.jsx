import { useState } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../auth/hooks/useAuth.js";
import Sidepanel from "../../../components/Sidepanel.jsx";
import DashboardHeader from "../components/DashboardHeader.jsx";
import DashboardPage from "./DashboardPage.jsx";
import OrdersPage from "./OrdersPage.jsx";
import AnalyticsPage from "./AnalyticsPage.jsx";
import TablesPage from "./TablesPage.jsx";
import PaymentsPage from "./PaymentsPage.jsx";
import MenuPage from "./MenuPage.jsx";
import StaffsPage from "./StaffsPage.jsx";
import ReviewsPage from "./ReviewsPage.jsx";
import NotFoundPage from "../../../pages/404NotFound.jsx";
import "../styles/adminPanel.css";




const AdminPanel = () => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Extract page identifier from sub-path, e.g. /admin/tables -> "tables"
  const subPath = location.pathname.replace(/^\/admin\/?/, "").split("/")[0];
  const activePage = subPath || "dashboard";

  const pages = {
    dashboard: {
      title: "Dashboard",
      subtitle: `Hello ${user?.name || "Admin"}, welcome back!`,
    },
    orders: {
      title: "Orders",
      subtitle: "Overview and management for orders",
    },
    analytics: {
      title: "Analytics",
      subtitle: "Overview and management for analytics",
    },
    tables: {
      title: "Tables",
      subtitle: "Overview and management for tables",
    },
    payments: {
      title: "Payments",
      subtitle: "Overview and management for payments",
    },
    menu: {
      title: "Menu",
      subtitle: "Catalog tools and category assignment",
    },
    staffs: {
      title: "Staffs",
      subtitle: "Approve or reject staff access requests",
    },
    reviews: {
      title: "Reviews",
      subtitle: "Browse customer ratings and feedback comments",
    },
  };

  const currentPage = pages[activePage] || pages.dashboard;

  const handlePageChange = (pageId) => {
    navigate(pageId === "dashboard" ? "/admin" : `/admin/${pageId}`);
    setMobileSidebarOpen(false);
  };

  return (
    <div className="admin-shell">
      <Sidepanel
        activePage={activePage}
        onPageChange={handlePageChange}
        isOpen={mobileSidebarOpen}
        onClose={() => setMobileSidebarOpen(false)}
      />
      <div className="admin-content-area">
        <DashboardHeader
          title={currentPage.title}
          subtitle={currentPage.subtitle}
          onToggleMobileMenu={() => setMobileSidebarOpen((prev) => !prev)}
        />
        <main className="admin-main-scroll">
          <Routes>
            <Route index element={<DashboardPage />} />
            <Route path="orders" element={<OrdersPage />} />
            <Route path="analytics" element={<AnalyticsPage />} />
            <Route path="tables" element={<TablesPage />} />
            <Route path="payments" element={<PaymentsPage />} />
            <Route path="menu" element={<MenuPage />} />
            <Route path="staffs" element={<StaffsPage />} />
            <Route path="reviews" element={<ReviewsPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};


export default AdminPanel;