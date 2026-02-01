import type { Socket, Server } from "socket.io";
import { Document } from "../models/document.model.js";
import type {
  ClientToServerEvents,
  ServerToClientEvents,
  Delta,
} from "../types/index.js";

type IOServer = Server<ClientToServerEvents, ServerToClientEvents>;
type IOSocket = Socket<ClientToServerEvents, ServerToClientEvents>;

const DEFAULT_DOCUMENT_DATA: Delta = { ops: [] };

async function findOrCreateDocument(id: string): Promise<Delta> {
  const doc = await Document.findById(id);
  if (doc) return doc.data;

  const created = await Document.create({
    _id: id,
    data: DEFAULT_DOCUMENT_DATA,
  });
  return created.data;
}

export function registerDocumentHandlers(
  _io: IOServer,
  socket: IOSocket,
): void {
  socket.on("get-document", async (documentId) => {
    if (!documentId || typeof documentId !== "string") return;

    const data = await findOrCreateDocument(documentId);

    await socket.join(documentId);
    socket.emit("load-document", data);

    socket.on("send-changes", (delta) => {
      socket.broadcast.to(documentId).emit("receive-changes", delta);
    });

    socket.on("save-document", async (data) => {
      await Document.findByIdAndUpdate(documentId, { data });
    });
  });
}
