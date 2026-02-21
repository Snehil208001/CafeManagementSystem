import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { apiGet } from "../../api/client";

interface OrderItem {
  name: string;
  price: number;
  quantity: number;
}

interface Order {
  id: string;
  items: OrderItem[];
  status: string;
  createdAt: string;
  table?: { tableNumber: number };
  payments?: { amount: number; paidAt: string; method: string }[];
}

export default function ReceiptPage() {
  const { orderId } = useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!orderId) return;
    apiGet<Order>(`/payments/receipt/${orderId}`)
      .then(setOrder)
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load"))
      .finally(() => setLoading(false));
  }, [orderId]);

  const handlePrint = () => window.print();

  if (loading) return <div className="min-h-screen bg-amber-50 flex items-center justify-center">Loading...</div>;
  if (error || !order) return <div className="min-h-screen bg-amber-50 flex items-center justify-center p-4"><p className="text-red-600">{error || "Receipt not found"}</p></div>;

  const items = order.items || [];
  const total = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const payment = order.payments?.[0];

  return (
    <div className="min-h-screen bg-amber-50 p-4 print:bg-white">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6 print:shadow-none">
        <h1 className="text-2xl font-bold text-center text-amber-900 mb-2">Cafe Bill</h1>
        <p className="text-center text-gray-600 text-sm mb-6">Thank you for your order!</p>

        <div className="border-b pb-4 mb-4">
          <p className="text-sm text-gray-600">Order # {order.id.slice(-8).toUpperCase()}</p>
          <p className="text-sm text-gray-600">Table {order.table?.tableNumber}</p>
          <p className="text-sm text-gray-600">{new Date(order.createdAt).toLocaleString()}</p>
        </div>

        <table className="w-full mb-4">
          <thead>
            <tr className="border-b text-left text-sm text-gray-600">
              <th className="py-2">Item</th>
              <th className="py-2 text-right">Qty</th>
              <th className="py-2 text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, i) => (
              <tr key={i} className="border-b text-sm">
                <td className="py-2">{item.name}</td>
                <td className="py-2 text-right">{item.quantity}</td>
                <td className="py-2 text-right">₹{(item.price * item.quantity).toFixed(0)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="border-t pt-4 mb-4">
          <div className="flex justify-between font-bold text-lg">
            <span>Total</span>
            <span>₹{total.toFixed(0)}</span>
          </div>
          {payment && (
            <p className="text-sm text-green-600 mt-2">Paid via {payment.method} • {new Date(payment.paidAt).toLocaleString()}</p>
          )}
        </div>

        <p className="text-center text-gray-500 text-sm">Please visit again!</p>

        <div className="mt-6 flex gap-4 print:hidden">
          <button onClick={handlePrint} className="flex-1 py-2 bg-amber-600 text-white rounded-lg font-medium">
            Print Bill
          </button>
          <Link to={`/order?table=${order.table?.tableNumber || 1}`} className="flex-1 py-2 bg-gray-200 text-gray-800 rounded-lg font-medium text-center">
            New Order
          </Link>
        </div>
      </div>
    </div>
  );
}
