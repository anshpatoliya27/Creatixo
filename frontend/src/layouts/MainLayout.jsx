import { Outlet } from "react-router-dom";
import Sidebar from "../components/sidebar";
import Topbar from "../components/Topbar";

function MainLayout() {
  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content">
        <Topbar />
        <Outlet />
      </div>
    </div>
  );
}

export default MainLayout;
