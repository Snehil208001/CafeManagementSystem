import { useEffect, useState, useCallback } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { apiGet, apiPost } from "../../api/client";
import type { Dish, Offer, Banner, OrderItem } from "../../types";
import BannerImage from "../../components/BannerImage";
import { useOrderUpdates } from "../../hooks/useSocket";

export default function OrderPage() {
  const [searchParams] = useSearchParams();
  const tableNumber = parseInt(searchParams.get("table") || "0", 10);

  const [dishes, setDishes] = useState<Dish[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [cart, setCart] = useState<{ dish: Dish; qty: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState<{ id: string; status: string } | null>(null);
  const [error, setError] = useState("");

  const fetchMenu = useCallback(async () => {
    try {
      const [menuRes, bannersRes] = await Promise.all([
        apiGet<{ dishes: Dish[]; offers: Offer[] }>("/menu"),
        apiGet<Banner[]>("/banners"),
      ]);
      setDishes(menuRes.dishes);
      setOffers(menuRes.offers);
      setBanners(bannersRes);
    } catch (e) {
      setError("Failed to load menu");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMenu();
  }, [fetchMenu]);

  useOrderUpdates(tableNumber || null, (order: unknown) => {
    const o = order as { id: string; status: string };
    if (o && orderPlaced?.id === o.id) {
      setOrderPlaced((prev) => (prev ? { ...prev, status: o.status } : null));
    }
  });

  const addToCart = (dish: Dish) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.dish.id === dish.id);
      if (existing) {
        return prev.map((c) =>
          c.dish.id === dish.id ? { ...c, qty: c.qty + 1 } : c
        );
      }
      return [...prev, { dish, qty: 1 }];
    });
  };

  const updateQty = (dishId: string, delta: number) => {
    setCart((prev) => {
      const item = prev.find((c) => c.dish.id === dishId);
      if (!item) return prev;
      const newQty = item.qty + delta;
      if (newQty <= 0) return prev.filter((c) => c.dish.id !== dishId);
      return prev.map((c) =>
        c.dish.id === dishId ? { ...c, qty: newQty } : c
      );
    });
  };

  const subtotal = cart.reduce((sum, c) => sum + c.dish.price * c.qty, 0);

  const placeOrder = async () => {
    if (cart.length === 0 || !tableNumber) return;
    setPlacing(true);
    setError("");
    try {
      const items: OrderItem[] = cart.map((c) => ({
        dishId: c.dish.id,
        name: c.dish.name,
        price: c.dish.price,
        quantity: c.qty,
      }));
      const order = await apiPost<{ id: string; status: string }>("/orders", {
        tableNumber,
        items,
      });
      setOrderPlaced(order);
      setCart([]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to place order");
    } finally {
      setPlacing(false);
    }
  };

  if (!tableNumber) {
    return (
      <div className="min-h-screen bg-amber-50 flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-amber-900">Invalid Table</h1>
          <p className="text-amber-700 mt-2">
            Please scan the QR code on your table to order.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-amber-50 flex items-center justify-center">
        <div className="text-amber-800 text-lg">Loading menu...</div>
      </div>
    );
  }

  const statusLabels: Record<string, string> = {
    pending: "Order received",
    confirmed: "Order confirmed",
    preparing: "Preparing your order",
    completed: "Ready!",
  };

  return (
    <div className="min-h-screen bg-amber-50 pb-24">
      <header className="bg-amber-800 text-white p-4 sticky top-0 z-10 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold">Cafe Menu</h1>
          <p className="text-amber-200 text-sm">Table {tableNumber}</p>
        </div>
        <Link to="/manager/login" className="text-amber-200 hover:text-white text-sm underline">
          Manager
        </Link>
      </header>

      {banners.length > 0 && (
        <div className="p-4 space-y-2 overflow-x-auto flex gap-2">
          {banners.map((b) => (
            <a
              key={b.id}
              href={b.link || "#"}
              className="flex-shrink-0 rounded-lg overflow-hidden w-64 h-24 bg-amber-100"
            >
              <BannerImage
                src={b.imageUrl}
                alt="Banner"
                className="w-full h-full object-cover"
              />
            </a>
          ))}
        </div>
      )}

      {offers.length > 0 && (
        <div className="px-4 py-2 bg-amber-100 rounded-lg mx-4 mb-4">
          <h2 className="font-semibold text-amber-900 mb-2">Offers</h2>
          <div className="flex flex-wrap gap-2">
            {offers.map((o) => (
              <span
                key={o.id}
                className="px-3 py-1 bg-amber-600 text-white rounded-full text-sm"
              >
                {o.title}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="px-4">
        {Object.entries(
          dishes.reduce<Record<string, Dish[]>>((acc, d) => {
            (acc[d.category] = acc[d.category] || []).push(d);
            return acc;
          }, {})
        ).map(([category, items]) => (
          <section key={category} className="mb-6">
            <h2 className="text-lg font-semibold text-amber-900 mb-3">
              {category}
            </h2>
            <div className="grid gap-3">
              {items.map((dish) => (
                <div
                  key={dish.id}
                  className="flex gap-4 p-3 bg-white rounded-lg shadow-sm"
                >
                  {dish.imageUrl ? (
                    <img
                      src={dish.imageUrl}
                      alt={dish.name}
                      className="w-20 h-20 object-cover rounded"
                    />
                  ) : (
                    <div className="w-20 h-20 bg-amber-200 rounded flex items-center justify-center text-amber-600 text-2xl">
                      ☕
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900">{dish.name}</h3>
                    {dish.description && (
                      <p className="text-sm text-gray-600 truncate">
                        {dish.description}
                      </p>
                    )}
                    <p className="text-amber-700 font-semibold">
                      ₹{dish.price}
                    </p>
                  </div>
                  <button
                    onClick={() => addToCart(dish)}
                    className="self-center px-4 py-2 bg-amber-600 text-white rounded-lg font-medium hover:bg-amber-700"
                  >
                    Add
                  </button>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>

      {/* Cart */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg p-4">
        {error && (
          <p className="text-red-600 text-sm mb-2">{error}</p>
        )}
        {orderPlaced && (
          <p className="text-green-700 font-medium mb-2">
            {statusLabels[orderPlaced.status] || orderPlaced.status}
          </p>
        )}
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 overflow-x-auto">
            {cart.length === 0 ? (
              <p className="text-gray-500">Cart is empty</p>
            ) : (
              <div className="flex gap-2 flex-wrap">
                {cart.map(({ dish, qty }) => (
                  <div
                    key={dish.id}
                    className="flex items-center gap-1 bg-amber-100 rounded px-2 py-1"
                  >
                    <span className="text-sm font-medium">{dish.name}</span>
                    <button
                      onClick={() => updateQty(dish.id, -1)}
                      className="w-6 h-6 rounded bg-amber-600 text-white text-sm"
                    >
                      -
                    </button>
                    <span className="w-6 text-center">{qty}</span>
                    <button
                      onClick={() => updateQty(dish.id, 1)}
                      className="w-6 h-6 rounded bg-amber-600 text-white text-sm"
                    >
                      +
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="flex items-center gap-4">
            <span className="font-bold text-amber-900">₹{subtotal}</span>
            <button
              onClick={placeOrder}
              disabled={cart.length === 0 || placing}
              className="px-6 py-2 bg-amber-600 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-amber-700"
            >
              {placing ? "Placing..." : "Place Order"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
