import { useEffect, useState } from "react";
import { apiGet } from "../../api/client";

interface Payment {
  id: string;
  orderId: string;
  amount: number;
  method: string;
  status: string;
  paidAt: string;
  billSent: boolean;
  order?: { table?: { tableNumber: number }; items: unknown[] };
}

export default function PaymentHistory() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGet<Payment[]>("/payments")
      .then(setPayments)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const totalAmount = payments.reduce((s, p) => s + p.amount, 0);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Payment History</h1>
      <div className="bg-amber-50 rounded-lg p-4 mb-6">
        <p className="text-sm text-amber-800">Total collected: <span className="font-bold text-lg">₹{totalAmount.toFixed(0)}</span></p>
        <p className="text-sm text-amber-700">{payments.length} payment(s)</p>
      </div>
      <div className="space-y-4">
        {payments.length === 0 ? (
          <p className="text-gray-500">No payments yet</p>
        ) : (
          payments.map((p) => (
            <div key={p.id} className="bg-white rounded-lg shadow p-4 border flex justify-between items-center">
              <div>
                <p className="font-semibold">Table {p.order?.table?.tableNumber ?? "?"}</p>
                <p className="text-sm text-gray-600">
                  ₹{p.amount.toFixed(0)} • {p.method} • {new Date(p.paidAt).toLocaleString()}
                </p>
                {p.billSent && <span className="text-xs text-green-600">Bill sent</span>}
              </div>
              <span className="text-green-700 font-bold">₹{p.amount.toFixed(0)}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
