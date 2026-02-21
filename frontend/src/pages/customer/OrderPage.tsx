import { useEffect, useState, useCallback } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { apiGet, apiPost } from "../../api/client";
import type { Dish, Offer, Banner, OrderItem } from "../../types";
import BannerImage from "../../components/BannerImage";
import { useOrderUpdates } from "../../hooks/useSocket";

export default function OrderPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const tableNumber = parseInt(searchParams.get("table") || "0", 10);
  const locationId = searchParams.get("location") || undefined;

  const [dishes, setDishes] = useState<Dish[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [cart, setCart] = useState<{ dish: Dish; qty: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState<{ id: string; status: string; total?: number } | null>(null);
  const [paying, setPaying] = useState(false);
  const [paid, setPaid] = useState(false);
  const [error, setError] = useState("");

  const fetchMenu = useCallback(async () => {
    try {
      const menuUrl = locationId ? `/menu?locationId=${locationId}` : "/menu";
      const [menuRes, bannersRes] = await Promise.all([
        apiGet<{ dishes: Dish[]; offers: Offer[] }>(menuUrl),
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
  }, [locationId]);

  useEffect(() => {
    fetchMenu();
  }, [fetchMenu]);

  useOrderUpdates(tableNumber || null, (order: unknown) => {
    const o = order as { id: string; status: string };
    if (o && orderPlaced?.id === o.id) {
      setOrderPlaced((prev) => (prev ? { ...prev, status: o.status } : null));
    }
  });

  const payNow = async () => {
    if (!orderPlaced?.id || !orderPlaced?.total) return;
    setPaying(true);
    setError("");
    try {
      await apiPost("/payments", {
        orderId: orderPlaced.id,
        amount: orderPlaced.total,
        method: "cash",
      });
      setPaid(true);
      navigate(`/receipt/${orderPlaced.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Payment failed");
    } finally {
      setPaying(false);
    }
  };

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
        ...(locationId && { locationId }),
      });
      setOrderPlaced({ ...order, total: subtotal });
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
    <div className="min-h-screen bg-amber-50 pb-32">
      <header className="bg-amber-800 text-white p-4 sticky top-0 z-10 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold">Cafe Menu</h1>
          <p className="text-amber-200 text-sm">Table {tableNumber}</p>
        </div>
        <Link to="/manager/login" className="text-amber-200 hover:text-white text-sm underline">
          Manager
        </Link>
      </header>

      {/* Banners - horizontal snap scroll */}
      {banners.length > 0 && (
        <div className="px-4 pb-4">
          <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory scrollbar-hide -mx-4 px-4">
            {banners.map((b) => (
              <a
                key={b.id}
                href={b.link || "#"}
                className="flex-shrink-0 w-[85vw] max-w-[320px] h-28 rounded-xl overflow-hidden snap-center bg-amber-100 shadow-sm"
              >
                <BannerImage
                  src={b.imageUrl}
                  alt="Banner"
                  className="w-full h-full object-cover"
                />
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Offers - compact pills */}
      {offers.length > 0 && (
        <div className="px-4 pb-4">
          <div className="flex flex-wrap gap-2">
            {offers.map((o) => (
              <span
                key={o.id}
                className="px-4 py-2 bg-amber-600/90 text-white rounded-full text-sm font-medium shadow-sm"
              >
                {o.title}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Category nav - sticky, horizontal scroll */}
      {(() => {
        const categoriesMap = dishes.reduce<Record<string, Dish[]>>((acc, d) => {
          const cat = d.category;
          if (!acc[cat]) acc[cat] = [];
          acc[cat].push(d);
          return acc;
        }, {});
        const categories = Object.keys(categoriesMap);
        return categories.length > 0 ? (
          <nav className="sticky top-[57px] z-20 bg-amber-50/95 backdrop-blur-sm border-b border-amber-200/60">
            <div className="flex gap-2 overflow-x-auto px-4 py-3 scrollbar-hide">
              {categories.map((cat) => (
                <a
                  key={cat}
                  href={`#cat-${cat.replace(/\s+/g, "-")}`}
                  className="flex-shrink-0 px-4 py-2 rounded-full bg-white text-amber-900 font-medium text-sm shadow-sm border border-amber-200/80 hover:bg-amber-100 active:bg-amber-200"
                >
                  {cat}
                </a>
              ))}
            </div>
          </nav>
        ) : null;
      })()}

      {/* Menu by category */}
      <div className="px-4 pb-6">
        {Object.entries(
          dishes.reduce<Record<string, Dish[]>>((acc, d) => {
            (acc[d.category] = acc[d.category] || []).push(d);
            return acc;
          }, {})
        ).map(([category, items]) => (
          <section
            key={category}
            id={`cat-${category.replace(/\s+/g, "-")}`}
            className="scroll-mt-24 mb-8"
          >
            <h2 className="text-lg font-bold text-amber-900 mb-4 pb-2 border-b-2 border-amber-200">
              {category}
            </h2>
            <div className="space-y-3">
              {items.map((dish) => (
                <div
                  key={dish.id}
                  className="flex gap-4 p-4 bg-white rounded-xl shadow-sm border border-amber-100/80 active:scale-[0.99] transition-transform"
                >
                  {dish.imageUrl ? (
                    <img
                      src={dish.imageUrl}
                      alt={dish.name}
                      className="w-24 h-24 sm:w-28 sm:h-28 object-cover rounded-lg flex-shrink-0"
                    />
                  ) : (
                    <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-lg flex-shrink-0 bg-amber-200 flex items-center justify-center text-amber-600 text-3xl">
                      ☕
                    </div>
                  )}
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900 text-base">
                        {dish.name}
                      </h3>
                      {dish.description && (
                        <p className="text-sm text-gray-600 line-clamp-2 mt-0.5">
                          {dish.description}
                        </p>
                      )}
                      <p className="text-amber-700 font-bold text-lg mt-1">
                        ₹{dish.price}
                      </p>
                    </div>
                    <button
                      onClick={() => addToCart(dish)}
                      className="mt-2 w-full py-3 px-4 bg-amber-600 text-white rounded-lg font-semibold text-sm hover:bg-amber-700 active:bg-amber-800 touch-manipulation min-h-[44px]"
                    >
                      Add to cart
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>

      {/* Cart - fixed bottom, mobile-friendly */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-amber-200 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
        {error && (
          <p className="text-red-600 text-sm mb-2">{error}</p>
        )}
        {orderPlaced && (
          <div className="mb-3">
            <p className="text-green-700 font-medium">
              {statusLabels[orderPlaced.status] || orderPlaced.status}
            </p>
            {orderPlaced.status === "completed" && !paid && (
              <button
                onClick={payNow}
                disabled={paying}
                className="mt-2 w-full py-3 px-4 bg-green-600 text-white rounded-xl font-semibold text-sm hover:bg-green-700 disabled:opacity-50 min-h-[44px] touch-manipulation"
              >
                {paying ? "Processing..." : "Pay ₹" + (orderPlaced.total || 0).toFixed(0) + " - Get Bill"}
              </button>
            )}
            {paid && <p className="text-green-600 text-sm mt-1">Redirecting to bill...</p>}
          </div>
        )}
        <div className="flex items-center justify-between gap-3">
          <div className="flex-1 min-w-0 overflow-x-auto scrollbar-hide">
            {cart.length === 0 ? (
              <p className="text-gray-500 text-sm">Cart is empty</p>
            ) : (
              <div className="flex gap-2">
                {cart.map(({ dish, qty }) => (
                  <div
                    key={dish.id}
                    className="flex items-center gap-2 flex-shrink-0 bg-amber-100 rounded-lg px-3 py-2 border border-amber-200/60"
                  >
                    <span className="text-sm font-medium max-w-[80px] truncate">{dish.name}</span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => updateQty(dish.id, -1)}
                        className="w-9 h-9 rounded-lg bg-amber-600 text-white font-bold text-lg flex items-center justify-center active:bg-amber-700 touch-manipulation"
                        aria-label="Decrease"
                      >
                        −
                      </button>
                      <span className="w-7 text-center font-semibold">{qty}</span>
                      <button
                        onClick={() => updateQty(dish.id, 1)}
                        className="w-9 h-9 rounded-lg bg-amber-600 text-white font-bold text-lg flex items-center justify-center active:bg-amber-700 touch-manipulation"
                        aria-label="Increase"
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <span className="font-bold text-amber-900 text-lg">₹{subtotal}</span>
            <button
              onClick={placeOrder}
              disabled={cart.length === 0 || placing}
              className="px-5 py-3 bg-amber-600 text-white rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-amber-700 active:bg-amber-800 min-h-[44px] touch-manipulation"
            >
              {placing ? "Placing..." : "Place Order"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
