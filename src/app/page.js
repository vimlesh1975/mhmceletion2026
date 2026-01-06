
"use client";

import { useEffect, useRef } from "react";
import io from "socket.io-client";

export default function Home() {

  const socketRef = useRef(null);

  useEffect(() => {

    socketRef.current = io();
    const socket = socketRef.current;

    if (!socket) return;

    // socket.emit("allContent", allContent);
    socket.on("test", (data) => {
      // dispatch(changenewdatabase(data));
      console.log(data)

    });

  })

  return (
    <div >
      <h1>Hello</h1>
    </div>
  );
}
