import { useEffect, useState } from "react";
import { apiGet } from "../../api/client";

type PopularDish = { name: string; quantity: number; revenue: number };
type PeakHour = { hour: number; label: string; orderCount: number };
type Summary = { totalOrders: number; completedOrders: number; totalRevenue: number };

export default function Analytics() {
  const [popular, setPopular] = useState<PopularDish[]>([]);
  const [peakHours, setPeakHours] = useState<PeakHour[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [p, h, s] = await Promise.all([
          apiGet<PopularDish[]>("/analytics/popular-dishes"),
          apiGet<PeakHour[]>("/analytics/peak-hours"),
          apiGet<Summary>("/analytics/summary"),
        ]);
        setPopular(p);
        setPeakHours(h);
        setSummary(s);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return <div className="text-gray-600">Loading analytics...</div>;
  }

  const maxPeak = Math.max(...peakHours.map((ph) => ph.orderCount), 1);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Analytics</h1>

      {/* Summary cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-4 border">
            <p className="text-gray-500 text-sm">Total Orders</p>
            <p className="text-2xl font-bold text-gray-900">{summary.totalOrders}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4 border">
            <p className="text-gray-500 text-sm">Completed Orders</p>
            <p className="text-2xl font-bold text-green-600">{summary.completedOrders}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4 border">
            <p className="text-gray-500 text-sm">Total Revenue</p>
            <p className="text-2xl font-bold text-amber-600">₹{summary.totalRevenue.toFixed(0)}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Popular dishes */}
        <div className="bg-white rounded-lg shadow p-6 border">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Popular Dishes</h2>
          {popular.length === 0 ? (
            <p className="text-gray-500">No data yet</p>
          ) : (
            <div className="space-y-3">
              {popular.map((d, i) => (
                <div key={d.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500 w-6">{i + 1}.</span>
                    <span className="font-medium">{d.name}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-amber-600 font-semibold">{d.quantity} sold</span>
                    <span className="text-gray-400 mx-2">·</span>
                    <span className="text-gray-600">₹{d.revenue.toFixed(0)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Peak hours */}
        <div className="bg-white rounded-lg shadow p-6 border">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Peak Hours</h2>
          {peakHours.length === 0 ? (
            <p className="text-gray-500">No data yet</p>
          ) : (
            <div className="space-y-2">
              {peakHours.map((ph) => (
                <div key={ph.hour} className="flex items-center gap-3">
                  <span className="text-gray-600 w-14">{ph.label}</span>
                  <div className="flex-1 h-6 bg-gray-100 rounded overflow-hidden">
                    <div
                      className="h-full bg-amber-500 rounded"
                      style={{ width: `${(ph.orderCount / maxPeak) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium w-8">{ph.orderCount}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
