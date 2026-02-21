import { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { apiGet, apiPost } from "../../api/client";
import type { CafeTable } from "../../types";

export default function QRPage() {
  const [tables, setTables] = useState<CafeTable[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTables = () => {
    setLoading(true);
    apiGet<CafeTable[]>("/tables")
      .then(setTables)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchTables();
  }, []);

  const createTables = async () => {
    try {
      await apiPost("/tables", { count: 5 });
      fetchTables();
    } catch (e) {
      console.error(e);
    }
  };

  const baseUrl = window.location.origin;

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Table QR Codes
      </h1>
      <p className="text-gray-600 mb-6">
        Print these QR codes and place them on each table. Customers scan to
        order.
      </p>
      {tables.length === 0 && (
        <div className="mb-6">
          <button
            onClick={createTables}
            className="px-4 py-2 bg-amber-600 text-white rounded hover:bg-amber-700"
          >
            Create 5 Tables
          </button>
        </div>
      )}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {tables.map((table) => {
          const url = `${baseUrl}/order?table=${table.tableNumber}`;
          return (
            <div
              key={table.id}
              className="bg-white p-4 rounded-lg shadow text-center"
            >
              <h3 className="font-semibold text-lg mb-2">
                Table {table.tableNumber}
              </h3>
              <div className="flex justify-center bg-white p-2 rounded">
                <QRCodeSVG value={url} size={128} level="M" />
              </div>
              <p className="text-xs text-gray-500 mt-2 break-all">{url}</p>
              <button
                onClick={() => window.print()}
                className="mt-2 px-3 py-1 text-sm bg-amber-100 text-amber-800 rounded hover:bg-amber-200"
              >
                Print
              </button>
            </div>
          );
        })}
      </div>
      {tables.length === 0 && (
        <p className="text-gray-500">No tables found. Create tables first.</p>
      )}
    </div>
  );
}
