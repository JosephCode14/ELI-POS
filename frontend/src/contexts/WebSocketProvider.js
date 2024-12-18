import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
} from "react";

const WebSocketContext = createContext(null);

export const WebSocketProvider = ({ children }) => {
  const [printerStatusWeb, setPrinterStatusWeb] = useState(null);
  const [socket, setSocket] = useState(null);
  const [reconnectInterval, setReconnectInterval] = useState(null);

  const [online, setOnline] = useState(true);

  const [kioskPrinter, setKioskPrinter] = useState(null);
  const [kitchenPrinter, setKitchenPrinter] = useState(null);

  const [printerCount, setPrinterCount] = useState({ online: 0, offline: 0 });

  const timeoutRef = useRef(null);

  const resetPrinterCount = () => {
    setKioskPrinter(null);
    setKitchenPrinter(null);
    setPrinterCount({ online: 0, offline: 0 });
  };

  useEffect(() => {
    const allPrinter = [kioskPrinter, kitchenPrinter];

    const onlineCount = allPrinter.filter((status) => status === true).length;
    const offlineCount = allPrinter.filter((status) => status === false).length;

    setPrinterCount({ online: onlineCount, offline: offlineCount });
  }, [kioskPrinter, kitchenPrinter]);

  window.addEventListener("offline", (event) => {
    console.log("offline");
    setOnline(false);
  });

  window.addEventListener("online", (event) => {
    setOnline(true);
    window.location.reload();

    // alert("Online");
  });

  useEffect(() => {
    // Function to initialize the WebSocket connection
    const connectWebSocket = () => {
      const newSocket = new WebSocket("wss://eli-pos.onrender.com");

      newSocket.onopen = () => {
        console.log("Connected to WebSocket server");
        setSocket(newSocket);

        // Clear any existing reconnection attempt
        if (reconnectInterval) {
          clearInterval(reconnectInterval);
          setReconnectInterval(null);
        }
      };

      newSocket.onmessage = (event) => {
        console.log("Received message from WebSocket:", event.data);
        try {
          // Check if the received data is JSON
          const parsedData = JSON.parse(event.data);

          if (parsedData.kioskPrinter !== undefined) {
            setKioskPrinter(parsedData.kioskPrinter);
          }

          if (parsedData.kitchenPrinter !== undefined) {
            setKitchenPrinter(parsedData.kitchenPrinter);
          }
        } catch (error) {
          console.log("Non-JSON message received:", event.data);

          if (event.data.startsWith("Printer status:")) {
            setPrinterStatusWeb(event.data);
          }
        }

        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = setTimeout(() => {
          resetPrinterCount();
        }, 12 * 1000);
      };

      newSocket.onclose = () => {
        console.log("WebSocket connection closed");

        // Start reconnection attempts if disconnected
        const intervalId = setInterval(() => {
          console.log("Attempting to reconnect...");
          connectWebSocket();
          window.location.reload();
        }, 5000);
        setReconnectInterval(intervalId);
      };

      newSocket.onerror = (error) => {
        console.error("WebSocket error:", error);
      };
    };

    connectWebSocket();

    // Cleanup function to close the WebSocket and stop reconnection attempts
    return () => {
      if (socket) socket.close();
      if (reconnectInterval) clearInterval(reconnectInterval);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [reconnectInterval]);

  return (
    <WebSocketContext.Provider
      value={{
        printerStatusWeb,
        socket,
        kioskPrinter,
        kitchenPrinter,
        printerCount,
        online,
      }}
    >
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => useContext(WebSocketContext);
