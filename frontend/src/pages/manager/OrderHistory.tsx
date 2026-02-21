import { useEffect, useState } from "react";
import { apiGet } from "../../api/client";
import type { Order } from "../../types";

export default function OrderHistory() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "completed">("all");

  useEffect(() => {
    apiGet<Order[]>("/orders/manager")
      .then(setOrders)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter === "completed"
    ? orders.filter((o) => o.status === "completed")
    : orders;

  const statusColors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800",
    confirmed: "bg-blue-100 text-blue-800",
    preparing: "bg-orange-100 text-orange-800",
    completed: "bg-green-100 text-green-800",
  };

  const formatDate = (d: string) => new Date(d).toLocaleString();

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Order History</h1>
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setFilter("all")}
          className={`px-4 py-2 rounded ${filter === "all" ? "bg-amber-600 text-white" : "bg-gray-200"}`}
        >
          All Orders
        </button>
        <button
          onClick={() => setFilter("completed")}
          className={`px-4 py-2 rounded ${filter === "completed" ? "bg-amber-600 text-white" : "bg-gray-200"}`}
        >
          Completed Only
        </button>
      </div>
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <p className="text-gray-500">No orders found</p>
        ) : (
          filtered.map((order) => {
            const items = order.items as { name: string; quantity: number; price: number }[];
            const total = items.reduce((s, i) => s + i.price * i.quantity, 0);
            const payments = (order as Order & { payments?: { amount: number; paidAt: string; method: string }[] }).payments || [];
            const paid = payments.length > 0;
            return (
              <div key={order.id} className="bg-white rounded-lg shadow p-4 border">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <span className="font-semibold">Table {order.table?.tableNumber ?? "?"}</span>
                    <span className="text-gray-500 text-sm ml-2">{formatDate(order.createdAt)}</span>
                  </div>
                  <div className="flex gap-2 items-center">
                    <span className={`px-3 py-1 rounded-full text-sm ${statusColors[order.status] || "bg-gray-100"}`}>
                      {order.status}
                    </span>
                    {paid && <span className="text-green-600 text-sm font-medium">Paid</span>}
                  </div>
                </div>
                <ul className="text-gray-700 text-sm space-y-1 mb-2">
                  {items.map((item, i) => (
                    <li key={i}>{item.name} x {item.quantity} - ₹{(item.price * item.quantity).toFixed(0)}</li>
                  ))}
                </ul>
                <div className="flex justify-between text-sm">
                  <span className="font-semibold">Total: ₹{total.toFixed(0)}</span>
                  {paid && <span className="text-gray-500">{payments[0].method} • {new Date(payments[0].paidAt).toLocaleString()}</span>}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
