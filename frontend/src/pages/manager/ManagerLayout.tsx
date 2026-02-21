import { Outlet, Link, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useLocation } from "../../contexts/LocationContext";

export default function ManagerLayout() {
  const navigate = useNavigate();
  const token = localStorage.getItem("managerToken");
  const { locations, selectedId, setSelectedId } = useLocation();

  useEffect(() => {
    if (!token) {
      navigate("/manager/login");
    }
  }, [token, navigate]);

  const logout = () => {
    localStorage.removeItem("managerToken");
    navigate("/manager/login");
  };

  if (!token) return null;

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-amber-800 text-white p-4 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-4 flex-wrap">
          {locations.length > 1 && (
            <select
              value={selectedId || ""}
              onChange={(e) => setSelectedId(e.target.value || null)}
              className="bg-amber-700 text-white px-3 py-1.5 rounded text-sm border-0"
            >
              {locations.map((loc) => (
                <option key={loc.id} value={loc.id}>
                  {loc.name}
                </option>
              ))}
            </select>
          )}
          <div className="flex gap-6">
          <Link to="/manager" className="font-medium hover:underline">
            Orders
          </Link>
          <Link to="/manager/order-history" className="font-medium hover:underline">
            Order History
          </Link>
          <Link to="/manager/payments" className="font-medium hover:underline">
            Payment History
          </Link>
          <Link to="/manager/analytics" className="font-medium hover:underline">
            Analytics
          </Link>
          <Link to="/manager/locations" className="font-medium hover:underline">
            Locations
          </Link>
          <Link to="/manager/menu" className="font-medium hover:underline">
            Menu
          </Link>
          <Link to="/manager/promos" className="font-medium hover:underline">
            Banners & Offers
          </Link>
          <Link to="/manager/qr" className="font-medium hover:underline">
            QR Codes
          </Link>
          <a href="/kitchen" target="_blank" rel="noopener noreferrer" className="font-medium hover:underline">
            Kitchen
          </a>
          </div>
        </div>
        <button
          onClick={logout}
          className="px-4 py-2 bg-amber-700 rounded hover:bg-amber-600"
        >
          Logout
        </button>
      </nav>
      <main className="p-6">
        <Outlet />
      </main>
    </div>
  );
}
