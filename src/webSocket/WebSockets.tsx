import { useEffect } from "react";
import { Client } from "@stomp/stompjs";

const WebSocketClient = ({ gameId, setBoardContent }: { gameId: string, setBoardContent: (board: any) => void }) => {
    /*useEffect(() => {
      if (!gameId) return;
  
      const client =  new Client({
        brokerURL: "ws://localhost:8080/ws",
        onConnect: () => {
          console.log("✅ Connected to WebSocket");
  
          client.subscribe(`/topic/game/${gameId}`, (message) => {
            const gameState = JSON.parse(message.body);
            console.log("♟️ Game update received:", gameState);
            if (Array.isArray(gameState.chessBoard)) {
              setBoardContent(gameState.chessBoard);
            }
          });
        },
        onDisconnect: () => console.log("❌ Disconnected from WebSocket"),
      });
  
      client.activate();
      return () => client.deactivate();
    }, [gameId]);
  
    return null;
    */
};

export default WebSocketClient;