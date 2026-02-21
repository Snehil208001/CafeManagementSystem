import { useEffect, useState } from "react";
import { apiGet, apiPatch } from "../../api/client";
import type { Order } from "../../types";
import { useSocket } from "../../hooks/useSocket";

export default function Dashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const socket = useSocket();

  const fetchOrders = async () => {
    try {
      const data = await apiGet<Order[]>("/orders/manager");
      setOrders(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    if (!socket) return;
    socket.on("order:new", fetchOrders);
    socket.on("order:updated", fetchOrders);
    return () => {
      socket.off("order:new", fetchOrders);
      socket.off("order:updated", fetchOrders);
    };
  }, [socket]);

  const updateStatus = async (orderId: string, status: string) => {
    try {
      await apiPatch(`/orders/${orderId}/status`, { status });
      fetchOrders();
    } catch (e) {
      console.error(e);
    }
  };

  const statusColors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800",
    confirmed: "bg-blue-100 text-blue-800",
    preparing: "bg-orange-100 text-orange-800",
    completed: "bg-green-100 text-green-800",
  };

  const activeOrders = orders.filter((o) => o.status !== "completed");

  if (loading) {
    return <div className="text-gray-600">Loading orders...</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Orders</h1>

      {activeOrders.length === 0 ? (
        <p className="text-gray-500">No active orders</p>
      ) : (
        <div className="space-y-4">
          {activeOrders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-lg shadow p-4 border"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="font-semibold text-lg">
                  Table {order.table?.tableNumber ?? "?"}
                </span>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    statusColors[order.status] || "bg-gray-100"
                  }`}
                >
                  {order.status}
                </span>
              </div>
              <ul className="space-y-1 text-gray-700 mb-4">
                {(order.items as { name: string; quantity: number; price: number }[]).map(
                  (item, i) => (
                    <li key={i}>
                      {item.name} x {item.quantity} - ₹
                      {(item.price * item.quantity).toFixed(0)}
                    </li>
                  )
                )}
              </ul>
              <div className="flex gap-2">
                {order.status === "pending" && (
                  <button
                    onClick={() => updateStatus(order.id, "confirmed")}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Confirm
                  </button>
                )}
                {order.status === "confirmed" && (
                  <button
                    onClick={() => updateStatus(order.id, "preparing")}
                    className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700"
                  >
                    Start Preparing
                  </button>
                )}
                {order.status === "preparing" && (
                  <button
                    onClick={() => updateStatus(order.id, "completed")}
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    Complete
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
