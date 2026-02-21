import { Routes, Route, Navigate } from "react-router-dom";
import OrderPage from "./pages/customer/OrderPage";
import KitchenDisplay from "./pages/kitchen/KitchenDisplay";
import ReceiptPage from "./pages/customer/ReceiptPage";
import LoginPage from "./pages/manager/LoginPage";
import ManagerLayout from "./pages/manager/ManagerLayout";
import Dashboard from "./pages/manager/Dashboard";
import OrderHistory from "./pages/manager/OrderHistory";
import PaymentHistory from "./pages/manager/PaymentHistory";
import MenuManager from "./pages/manager/MenuManager";
import PromosManager from "./pages/manager/PromosManager";
import QRPage from "./pages/manager/QRPage";
import Analytics from "./pages/manager/Analytics";
import { LocationProvider } from "./contexts/LocationContext";
import LocationsPage from "./pages/manager/LocationsPage";

export default function App() {
  return (
    <Routes>
      <Route path="/order" element={<OrderPage />} />
      <Route path="/receipt/:orderId" element={<ReceiptPage />} />
      <Route path="/kitchen" element={<KitchenDisplay />} />
      <Route path="/manager/login" element={<LoginPage />} />
      <Route path="/manager" element={<LocationProvider><ManagerLayout /></LocationProvider>}>
        <Route index element={<Dashboard />} />
        <Route path="order-history" element={<OrderHistory />} />
        <Route path="payments" element={<PaymentHistory />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="locations" element={<LocationsPage />} />
        <Route path="menu" element={<MenuManager />} />
        <Route path="promos" element={<PromosManager />} />
        <Route path="qr" element={<QRPage />} />
      </Route>
      <Route path="/" element={<Navigate to="/order?table=1" replace />} />
      <Route path="*" element={<Navigate to="/order?table=1" replace />} />
    </Routes>
  );
}
