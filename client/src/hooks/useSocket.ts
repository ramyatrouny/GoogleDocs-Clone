import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { SERVER_URL } from "@/config/env";

export function useSocket(): Socket | null {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const socket = io(SERVER_URL);
    socketRef.current = socket;

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, []);

  return socketRef.current;
}
