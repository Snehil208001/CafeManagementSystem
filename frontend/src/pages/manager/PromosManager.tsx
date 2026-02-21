import { useEffect, useState } from "react";
import { apiGet, apiPost, apiDelete } from "../../api/client";
import type { Banner, Offer } from "../../types";
import BannerImage from "../../components/BannerImage";

export default function PromosManager() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"banners" | "offers">("banners");

  const [bannerForm, setBannerForm] = useState({
    imageUrl: "",
    link: "",
    position: "0",
  });
  const [offerForm, setOfferForm] = useState({
    title: "",
    description: "",
    discountType: "percentage" as "percentage" | "fixed",
    discountValue: "",
    applicableDishIds: "",
  });

  const fetchData = async () => {
    try {
      const [b, o] = await Promise.all([
        apiGet<Banner[]>("/banners/all"),
        apiGet<Offer[]>("/offers"),
      ]);
      setBanners(b);
      setOffers(o);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const addBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiPost("/banners", {
        imageUrl: bannerForm.imageUrl,
        link: bannerForm.link || null,
        position: parseInt(bannerForm.position) || 0,
      });
      setBannerForm({ imageUrl: "", link: "", position: "0" });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const addOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiPost("/offers", {
        title: offerForm.title,
        description: offerForm.description || null,
        discountType: offerForm.discountType,
        discountValue: parseFloat(offerForm.discountValue),
        applicableDishIds: offerForm.applicableDishIds
          ? offerForm.applicableDishIds.split(",").map((s) => s.trim())
          : [],
      });
      setOfferForm({
        title: "",
        description: "",
        discountType: "percentage",
        discountValue: "",
        applicableDishIds: "",
      });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const deleteBanner = async (id: string) => {
    if (!confirm("Delete this banner?")) return;
    try {
      await apiDelete(`/banners/${id}`);
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  const deleteOffer = async (id: string) => {
    if (!confirm("Delete this offer?")) return;
    try {
      await apiDelete(`/offers/${id}`);
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Banners & Offers
      </h1>

      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setActiveTab("banners")}
          className={`px-4 py-2 rounded ${
            activeTab === "banners"
              ? "bg-amber-600 text-white"
              : "bg-gray-200"
          }`}
        >
          Banners
        </button>
        <button
          onClick={() => setActiveTab("offers")}
          className={`px-4 py-2 rounded ${
            activeTab === "offers" ? "bg-amber-600 text-white" : "bg-gray-200"
          }`}
        >
          Offers
        </button>
      </div>

      {activeTab === "banners" && (
        <>
          <form
            onSubmit={addBanner}
            className="bg-white p-4 rounded-lg shadow mb-6 max-w-md space-y-3"
          >
            <h2 className="font-semibold">Add Banner</h2>
            {bannerForm.imageUrl && (
              <div className="rounded border overflow-hidden w-48 h-24">
                <BannerImage
                  src={bannerForm.imageUrl}
                  alt="Preview"
                  className="w-full h-full object-contain"
                />
              </div>
            )}
            <input
              placeholder="Image URL (e.g. https://example.com/image.jpg)"
              value={bannerForm.imageUrl}
              onChange={(e) =>
                setBannerForm((f) => ({ ...f, imageUrl: e.target.value }))
              }
              className="w-full px-3 py-2 border rounded"
              required
            />
            <input
              placeholder="Link (optional)"
              value={bannerForm.link}
              onChange={(e) =>
                setBannerForm((f) => ({ ...f, link: e.target.value }))
              }
              className="w-full px-3 py-2 border rounded"
            />
            <input
              type="number"
              placeholder="Position"
              value={bannerForm.position}
              onChange={(e) =>
                setBannerForm((f) => ({ ...f, position: e.target.value }))
              }
              className="w-full px-3 py-2 border rounded"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-amber-600 text-white rounded hover:bg-amber-700"
            >
              Add Banner
            </button>
          </form>
          <div className="space-y-4">
            {banners.map((b) => (
              <div
                key={b.id}
                className="bg-white p-4 rounded-lg shadow flex items-center justify-between"
              >
                <BannerImage
                  src={b.imageUrl}
                  alt="Banner"
                  className="w-32 h-16 object-cover rounded"
                />
                <div className="flex-1 mx-4">
                  <p className="text-sm text-gray-600">
                    Link: {b.link || "None"} | Pos: {b.position}
                  </p>
                </div>
                <button
                  onClick={() => deleteBanner(b.id)}
                  className="px-3 py-1 bg-red-100 text-red-800 rounded"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        </>
      )}

      {activeTab === "offers" && (
        <>
          <form
            onSubmit={addOffer}
            className="bg-white p-4 rounded-lg shadow mb-6 max-w-md space-y-3"
          >
            <h2 className="font-semibold">Add Offer</h2>
            <input
              placeholder="Title"
              value={offerForm.title}
              onChange={(e) =>
                setOfferForm((f) => ({ ...f, title: e.target.value }))
              }
              className="w-full px-3 py-2 border rounded"
              required
            />
            <input
              placeholder="Description"
              value={offerForm.description}
              onChange={(e) =>
                setOfferForm((f) => ({ ...f, description: e.target.value }))
              }
              className="w-full px-3 py-2 border rounded"
            />
            <select
              value={offerForm.discountType}
              onChange={(e) =>
                setOfferForm((f) => ({
                  ...f,
                  discountType: e.target.value as "percentage" | "fixed",
                }))
              }
              className="w-full px-3 py-2 border rounded"
            >
              <option value="percentage">Percentage</option>
              <option value="fixed">Fixed Amount</option>
            </select>
            <input
              type="number"
              placeholder="Discount value"
              value={offerForm.discountValue}
              onChange={(e) =>
                setOfferForm((f) => ({ ...f, discountValue: e.target.value }))
              }
              className="w-full px-3 py-2 border rounded"
              required
            />
            <input
              placeholder="Dish IDs (comma-separated, empty=all)"
              value={offerForm.applicableDishIds}
              onChange={(e) =>
                setOfferForm((f) => ({ ...f, applicableDishIds: e.target.value }))
              }
              className="w-full px-3 py-2 border rounded"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-amber-600 text-white rounded hover:bg-amber-700"
            >
              Add Offer
            </button>
          </form>
          <div className="space-y-4">
            {offers.map((o) => (
              <div
                key={o.id}
                className="bg-white p-4 rounded-lg shadow flex justify-between items-center"
              >
                <div>
                  <h3 className="font-medium">{o.title}</h3>
                  <p className="text-sm text-gray-600">
                    {o.discountType === "percentage"
                      ? `${o.discountValue}% off`
                      : `₹${o.discountValue} off`}
                  </p>
                </div>
                <button
                  onClick={() => deleteOffer(o.id)}
                  className="px-3 py-1 bg-red-100 text-red-800 rounded"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
