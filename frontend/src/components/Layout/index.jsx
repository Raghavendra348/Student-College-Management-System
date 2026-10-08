import { Outlet } from "react-router-dom";
import Sidebar from "../Sidebar";
import "./index.css";

const Layout = () => {
  return (
    <div className="layout-container">
      <Sidebar />
      <main className="layout-content">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;