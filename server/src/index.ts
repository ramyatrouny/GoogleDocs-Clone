import mongoose from "mongoose";
import { Server } from "socket.io";
import { env } from "./config/env.js";
import { registerDocumentHandlers } from "./handlers/document.handler.js";
import type { ClientToServerEvents, ServerToClientEvents } from "./types/index.js";

const io = new Server<ClientToServerEvents, ServerToClientEvents>(env.PORT, {
  cors: {
    origin: env.CLIENT_ORIGIN,
    methods: ["GET", "POST"],
  },
});

async function bootstrap(): Promise<void> {
  await mongoose.connect(env.MONGODB_URI);
  console.log(`[db] Connected to MongoDB`);

  io.on("connection", (socket) => {
    registerDocumentHandlers(io, socket);
  });

  console.log(`[server] Socket.IO listening on port ${env.PORT}`);
}

function shutdown(): void {
  console.log("\n[server] Shutting down gracefully...");
  io.close();
  mongoose.connection.close().then(() => {
    console.log("[db] Connection closed");
    process.exit(0);
  });
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

bootstrap().catch((err) => {
  console.error("[server] Failed to start:", err);
  process.exit(1);
});
