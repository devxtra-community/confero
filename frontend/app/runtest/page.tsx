"use client";

import { io } from "socket.io-client";
import { useEffect } from "react";

export default function SocketTest() {
  useEffect(() => {
    console.log("use effect mounted")
    const socket = io("http://localhost:4001", {
      auth: {
        token: localStorage.getItem("accessToken"),
      },
    });

    socket.on("auth:success", () => {
      console.log("✅ Auth success");
    });

    socket.on("connect_error", (err) => {
      console.error("❌", err.message);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return <div>Socket test</div>;
}
