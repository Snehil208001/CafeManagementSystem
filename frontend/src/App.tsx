import { Routes, Route, Navigate } from "react-router-dom";
import OrderPage from "./pages/customer/OrderPage";
import LoginPage from "./pages/manager/LoginPage";
import ManagerLayout from "./pages/manager/ManagerLayout";
import Dashboard from "./pages/manager/Dashboard";
import MenuManager from "./pages/manager/MenuManager";
import PromosManager from "./pages/manager/PromosManager";
import QRPage from "./pages/manager/QRPage";

export default function App() {
  return (
    <Routes>
      <Route path="/order" element={<OrderPage />} />
      <Route path="/manager/login" element={<LoginPage />} />
      <Route path="/manager" element={<ManagerLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="menu" element={<MenuManager />} />
        <Route path="promos" element={<PromosManager />} />
        <Route path="qr" element={<QRPage />} />
      </Route>
      <Route path="/" element={<Navigate to="/order?table=1" replace />} />
      <Route path="*" element={<Navigate to="/order?table=1" replace />} />
    </Routes>
  );
}
