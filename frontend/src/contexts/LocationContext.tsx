import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import { apiGet } from "../api/client";

type Location = { id: string; name: string; address?: string | null };

const LocationContext = createContext<{
  locations: Location[];
  selectedId: string | null;
  setSelectedId: (id: string | null) => void;
  loading: boolean;
  refreshLocations: () => void;
} | null>(null);

export function LocationProvider({ children }: { children: ReactNode }) {
  const [locations, setLocations] = useState<Location[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshLocations = () => {
    apiGet<Location[]>("/locations")
      .then((data) => {
        setLocations(data);
        setSelectedId((prev) => (prev && data.some((d) => d.id === prev)) ? prev : (data[0]?.id ?? null));
      })
      .catch(() => setLocations([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    refreshLocations();
  }, []);

  return (
    <LocationContext.Provider value={{ locations, selectedId, setSelectedId, loading, refreshLocations }}>
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  const ctx = useContext(LocationContext);
  if (!ctx) throw new Error("useLocation must be used within LocationProvider");
  return ctx;
}
