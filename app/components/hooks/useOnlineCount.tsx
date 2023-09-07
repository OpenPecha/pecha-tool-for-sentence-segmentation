import { useEffect, useState } from "react";
import { useSocket } from "../contexts/SocketContext";

export function useOnlineCount() {
  const [onlineCount, setOnlineCount] = useState(0);
  const socket = useSocket();
  useEffect(() => {
    if (!socket) return;
    socket.on("count", (data) => {
      setOnlineCount(data);
    });
  }, [socket]);

  return onlineCount;
}
