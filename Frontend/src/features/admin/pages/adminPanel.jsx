import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
import "../styles/adminPanel.css";




const AdminPanel = () => {
  const [activePage, setActivePage] = useState("dashboard");
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const { handleLogout, user } = useAuth();
  const navigate = useNavigate();
  const pages = {
    dashboard: {
      title: "Dashboard",
      subtitle: `Hello ${user?.name || "Admin"}, welcome back!`,
      component: DashboardPage,
    },
    orders: {
      title: "Orders",
      subtitle: "Overview and management for orders",
      component: OrdersPage,
    },
    analytics: {
      title: "Analytics",
      subtitle: "Overview and management for analytics",
      component: AnalyticsPage,
    },
    tables: {
      title: "Tables",
      subtitle: "Overview and management for tables",
      component: TablesPage,
    },
    payments: {
      title: "Payments",
      subtitle: "Overview and management for payments",
      component: PaymentsPage,
    },
    menu: {
      title: "Menu",
      subtitle: "Catalog tools and category assignment",
      component: MenuPage,
    },
    staffs: {
      title: "Staffs",
      subtitle: "Approve or reject staff access requests",
      component: StaffsPage,
    },
  };
  const currentPage = pages[activePage] || pages.dashboard;
  const ActivePageComponent = currentPage.component;
  const handlePageChange = (pageId) => {
    setActivePage(pageId);
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
          <ActivePageComponent />
        </main>
      </div>
    </div>
  );
};


export default AdminPanel;