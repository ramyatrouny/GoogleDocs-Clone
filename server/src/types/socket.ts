import type { Delta } from "./document.js";

export interface ClientToServerEvents {
  "get-document": (documentId: string) => void;
  "send-changes": (delta: Delta) => void;
  "save-document": (data: Delta) => void;
}

export interface ServerToClientEvents {
  "load-document": (data: Delta) => void;
  "receive-changes": (delta: Delta) => void;
}
