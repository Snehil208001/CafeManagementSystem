import { useEffect, useState } from "react";
import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL.replace(/\/$/, "").replace(/\/api$/, "")
  : window.location.origin;

export function useSocket() {
  const [socket, setSocket] = useState<ReturnType<typeof io> | null>(null);

  useEffect(() => {
    const s = io(SOCKET_URL);
    setSocket(s);
    return () => {
      s.disconnect();
    };
  }, []);

  return socket;
}

export function useOrderUpdates(tableNumber: number | null, onOrder: (order: unknown) => void) {
  const socket = useSocket();

  useEffect(() => {
    if (!socket || !tableNumber) return;
    socket.emit("join-table", tableNumber);
    const handler = (order: unknown) => onOrder(order);
    socket.on(`order:table:${tableNumber}`, handler);
    return () => {
      socket.off(`order:table:${tableNumber}`, handler);
    };
  }, [socket, tableNumber, onOrder]);
}
