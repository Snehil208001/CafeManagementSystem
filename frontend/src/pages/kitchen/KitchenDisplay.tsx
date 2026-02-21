import { useEffect, useState } from "react";
import { kitchenApi } from "../../api/client";
import type { Order } from "../../types";
import { useSocket } from "../../hooks/useSocket";

type OrderItem = { name: string; quantity: number; price: number };

export default function KitchenDisplay() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const socket = useSocket();

  const fetchOrders = async () => {
    try {
      const data = await kitchenApi<Order[]>("/orders/kitchen");
      setOrders(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 30000);
    return () => clearInterval(interval);
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
      await kitchenApi(`/orders/kitchen/${orderId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      fetchOrders();
    } catch (e) {
      console.error(e);
    }
  };

  const statusConfig: Record<string, { label: string; next: string; bg: string; nextBg: string }> = {
    pending: { label: "New", next: "confirmed", bg: "bg-amber-500", nextBg: "bg-blue-600" },
    confirmed: { label: "Confirmed", next: "preparing", bg: "bg-blue-600", nextBg: "bg-orange-600" },
    preparing: { label: "Preparing", next: "completed", bg: "bg-orange-600", nextBg: "bg-green-600" },
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <p className="text-slate-300 text-xl">Loading orders...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white p-4 md:p-6">
      <header className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-white">Kitchen Display</h1>
        <p className="text-slate-400 text-sm mt-1">
          {orders.length} active order{orders.length !== 1 ? "s" : ""}
        </p>
      </header>

      {orders.length === 0 ? (
        <div className="text-center py-16 text-slate-500 text-lg">
          No orders to prepare
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {orders.map((order) => {
            const items = (order.items as OrderItem[]) || [];
            const cfg = statusConfig[order.status];
            return (
              <div
                key={order.id}
                className={`rounded-xl p-4 border-2 ${
                  order.status === "pending"
                    ? "border-amber-500 bg-amber-500/10"
                    : order.status === "confirmed"
                    ? "border-blue-500 bg-blue-500/10"
                    : "border-orange-500 bg-orange-500/10"
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xl font-bold">Table {order.table?.tableNumber ?? "?"}</span>
                  <span className={`px-3 py-1 rounded-lg text-sm font-semibold ${cfg?.bg || "bg-gray-600"}`}>
                    {cfg?.label || order.status}
                  </span>
                </div>
                <ul className="space-y-2 mb-4">
                  {items.map((item, i) => (
                    <li key={i} className="flex justify-between text-base">
                      <span>
                        <strong>{item.name}</strong> × {item.quantity}
                      </span>
                    </li>
                  ))}
                </ul>
                {cfg?.next && (
                  <button
                    onClick={() => updateStatus(order.id, cfg.next)}
                    className={`w-full py-3 rounded-lg font-bold text-white ${cfg.nextBg} hover:opacity-90 active:scale-[0.98] transition-transform`}
                  >
                    {cfg.next === "confirmed" && "Confirm"}
                    {cfg.next === "preparing" && "Start Preparing"}
                    {cfg.next === "completed" && "Mark Ready"}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
