import { useEffect, useState, useRef, useCallback } from "react";
import io from "socket.io-client";

export function useWebSocket(url, options = {}) {
  const {
    autoConnect = true,
    reconnection = true,
    reconnectionAttempts = 5,
    reconnectionDelay = 1000,
    auth = {},
  } = options;

  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState(null);
  const [error, setError] = useState(null);
  const socketRef = useRef(null);

  const connect = useCallback(() => {
    if (socketRef.current?.connected) return;

    try {
      socketRef.current = io(url, {
        autoConnect,
        reconnection,
        reconnectionAttempts,
        reconnectionDelay,
        auth,
      });

      socketRef.current.on("connect", () => {
        setIsConnected(true);
        setError(null);
        console.log("WebSocket connected");
      });

      socketRef.current.on("disconnect", (reason) => {
        setIsConnected(false);
        console.log("WebSocket disconnected:", reason);
      });

      socketRef.current.on("error", (err) => {
        setError(err);
        console.error("WebSocket error:", err);
      });

      socketRef.current.on("simulation-update", (data) => {
        setLastMessage(data);
      });
    } catch (err) {
      setError(err);
      console.error("Failed to connect WebSocket:", err);
    }
  }, [
    url,
    autoConnect,
    reconnection,
    reconnectionAttempts,
    reconnectionDelay,
    auth,
  ]);

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
  }, []);

  const emit = useCallback((event, data) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit(event, data);
    }
  }, []);

  const subscribe = useCallback((event, handler) => {
    if (socketRef.current) {
      socketRef.current.on(event, handler);
    }
  }, []);

  const unsubscribe = useCallback((event, handler) => {
    if (socketRef.current) {
      socketRef.current.off(event, handler);
    }
  }, []);

  useEffect(() => {
    if (autoConnect) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [autoConnect, connect, disconnect]);

  return {
    isConnected,
    lastMessage,
    error,
    connect,
    disconnect,
    emit,
    subscribe,
    unsubscribe,
  };
}
