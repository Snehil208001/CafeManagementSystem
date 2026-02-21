import { Server as HttpServer } from "http";
import { Server } from "socket.io";

let io: Server | null = null;

export function initSocket(httpServer: HttpServer) {
  io = new Server(httpServer, {
    cors: {
      origin: "*",
    },
  });

  io.on("connection", (socket) => {
    socket.on("join-table", (tableNumber: number) => {
      socket.join(`table-${tableNumber}`);
    });
  });

  return io;
}

export function getIO(): Server | null {
  return io;
}
