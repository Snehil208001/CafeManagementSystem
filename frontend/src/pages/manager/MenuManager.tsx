import { useEffect, useState } from "react";
import { apiGet, apiPost, apiPut, apiDelete } from "../../api/client";
import type { Dish } from "../../types";
import { useLocation } from "../../contexts/LocationContext";

export default function MenuManager() {
  const { selectedId: locationId } = useLocation();
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Dish | null>(null);
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    category: "Beverages",
    imageUrl: "",
  });

  const fetchDishes = async () => {
    if (!locationId) return;
    try {
      const data = await apiGet<Dish[]>(`/menu/all?locationId=${locationId}`);
      setDishes(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDishes();
  }, [locationId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editing) {
        await apiPut(`/menu/${editing.id}`, {
          name: form.name,
          description: form.description || null,
          price: parseFloat(form.price),
          category: form.category,
          imageUrl: form.imageUrl || null,
        });
      } else {
        await apiPost("/menu", {
          name: form.name,
          description: form.description || null,
          price: parseFloat(form.price),
          category: form.category,
          imageUrl: form.imageUrl || null,
          locationId,
        });
      }
      setForm({ name: "", description: "", price: "", category: "Beverages", imageUrl: "" });
      setEditing(null);
      fetchDishes();
    } catch (e) {
      console.error(e);
    }
  };

  const handleEdit = (dish: Dish) => {
    setEditing(dish);
    setForm({
      name: dish.name,
      description: dish.description || "",
      price: String(dish.price),
      category: dish.category,
      imageUrl: dish.imageUrl || "",
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this dish?")) return;
    try {
      await apiDelete(`/menu/${id}`);
      fetchDishes();
    } catch (e) {
      console.error(e);
    }
  };

  const categories = ["Beverages", "Food", "Desserts", "Snacks", "Other"];

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Menu Management</h1>

      <form
        onSubmit={handleSubmit}
        className="bg-white p-4 rounded-lg shadow mb-6 space-y-3 max-w-md"
      >
        <h2 className="font-semibold">{editing ? "Edit Dish" : "Add Dish"}</h2>
        <input
          placeholder="Name"
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          className="w-full px-3 py-2 border rounded"
          required
        />
        <input
          placeholder="Description"
          value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          className="w-full px-3 py-2 border rounded"
        />
        <input
          type="number"
          placeholder="Price"
          value={form.price}
          onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
          className="w-full px-3 py-2 border rounded"
          required
        />
        <select
          value={form.category}
          onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
          className="w-full px-3 py-2 border rounded"
        >
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <input
          placeholder="Image URL (optional)"
          value={form.imageUrl}
          onChange={(e) => setForm((f) => ({ ...f, imageUrl: e.target.value }))}
          className="w-full px-3 py-2 border rounded"
        />
        <div className="flex gap-2">
          <button
            type="submit"
            className="px-4 py-2 bg-amber-600 text-white rounded hover:bg-amber-700"
          >
            {editing ? "Update" : "Add"}
          </button>
          {editing && (
            <button
              type="button"
              onClick={() => {
                setEditing(null);
                setForm({ name: "", description: "", price: "", category: "Beverages", imageUrl: "" });
              }}
              className="px-4 py-2 bg-gray-300 rounded"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="grid gap-4">
        {dishes.map((dish) => (
          <div
            key={dish.id}
            className="bg-white p-4 rounded-lg shadow flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              {dish.imageUrl ? (
                <img
                  src={dish.imageUrl}
                  alt={dish.name}
                  className="w-16 h-16 object-cover rounded"
                />
              ) : (
                <div className="w-16 h-16 bg-amber-200 rounded flex items-center justify-center">
                  ☕
                </div>
              )}
              <div>
                <h3 className="font-medium">{dish.name}</h3>
                <p className="text-sm text-gray-600">{dish.category} - ₹{dish.price}</p>
                {!dish.isAvailable && (
                  <span className="text-red-600 text-sm">Unavailable</span>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleEdit(dish)}
                className="px-3 py-1 bg-blue-100 text-blue-800 rounded hover:bg-blue-200"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(dish.id)}
                className="px-3 py-1 bg-red-100 text-red-800 rounded hover:bg-red-200"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
