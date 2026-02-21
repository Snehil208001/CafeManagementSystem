import { useState } from "react";
import { apiPost } from "../../api/client";
import { useLocation } from "../../contexts/LocationContext";

type Location = { id: string; name: string; address?: string | null };

export default function LocationsPage() {
  const { locations, setSelectedId, loading, refreshLocations } = useLocation();
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [creating, setCreating] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setCreating(true);
    try {
      const loc = await apiPost<Location>("/locations", { name: name.trim(), address: address.trim() || null });
      refreshLocations();
      setSelectedId(loc.id);
      setName("");
      setAddress("");
    } catch (e) {
      console.error(e);
    } finally {
      setCreating(false);
    }
  };

  if (loading) return <div className="text-gray-600">Loading...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Locations</h1>

      <form onSubmit={handleCreate} className="bg-white p-4 rounded-lg shadow mb-6 max-w-md space-y-3">
        <h2 className="font-semibold">Add Location</h2>
        <input
          placeholder="Location name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-3 py-2 border rounded"
          required
        />
        <input
          placeholder="Address (optional)"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className="w-full px-3 py-2 border rounded"
        />
        <button
          type="submit"
          disabled={creating}
          className="px-4 py-2 bg-amber-600 text-white rounded hover:bg-amber-700 disabled:opacity-50"
        >
          {creating ? "Adding..." : "Add Location"}
        </button>
      </form>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left">Name</th>
              <th className="px-4 py-2 text-left">Address</th>
            </tr>
          </thead>
          <tbody>
            {locations.map((loc) => (
              <tr key={loc.id} className="border-t">
                <td className="px-4 py-2 font-medium">{loc.name}</td>
                <td className="px-4 py-2 text-gray-600">{loc.address || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
