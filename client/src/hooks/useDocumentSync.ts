import { useEffect } from "react";
import type { Socket } from "socket.io-client";
import type Quill from "quill";
import type { Delta } from "@/types/document";

const SAVE_INTERVAL_MS = 2000;

export function useDocumentSync(
  socket: Socket | null,
  quill: Quill | null,
  documentId: string,
): void {
  // Load document from server
  useEffect(() => {
    if (!socket || !quill) return;

    socket.once("load-document", (document: Delta) => {
      quill.setContents(document);
      quill.enable();
    });

    socket.emit("get-document", documentId);
  }, [socket, quill, documentId]);

  // Broadcast local changes to other clients
  useEffect(() => {
    if (!socket || !quill) return;

    const handler = (delta: Delta, _oldDelta: Delta, source: string) => {
      if (source !== "user") return;
      socket.emit("send-changes", delta);
    };

    quill.on("text-change", handler);
    return () => {
      quill.off("text-change", handler);
    };
  }, [socket, quill]);

  // Receive remote changes
  useEffect(() => {
    if (!socket || !quill) return;

    const handler = (delta: Delta) => {
      quill.updateContents(delta);
    };

    socket.on("receive-changes", handler);
    return () => {
      socket.off("receive-changes", handler);
    };
  }, [socket, quill]);

  // Auto-save at interval
  useEffect(() => {
    if (!socket || !quill) return;

    const interval = setInterval(() => {
      socket.emit("save-document", quill.getContents());
    }, SAVE_INTERVAL_MS);

    return () => {
      clearInterval(interval);
    };
  }, [socket, quill]);
}
