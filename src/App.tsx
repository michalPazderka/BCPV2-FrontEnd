import React, { useEffect, useState, useCallback } from "react";
import "./App.css";
import { AbsGame } from "./game/AbsGame";
import { Client } from "@stomp/stompjs";
import { GameFactory } from "./gameFactory/GameFactory";
import { ChessBoard } from "./board/ChessBoard";
import ColorsMenu from "./colorMenu/ColorMenu";
import { FigureColor } from "./eunums/Color";
import { Games } from "./eunums/Games";
import { OthelloBoard } from "./board/OthelloBoard";


const App: React.FC = () => {
  const [boardContent, setBoardContent] = useState<JSX.Element | null>(null);
  const [chessGame, setChessGame] = useState<AbsGame | null>(null);
  const [gameId, setGameId] = useState<string | null>(null);
  const [showGames, setShowGames] = useState(false);
  const [showGameOptions, setShowGameOptions] = useState(false);
  const [showColors, setShowColors] = useState(false);
  const [stompClient, setStompClient] = useState<Client | null>(null);
  const [selectedColor, setSelectedColor] = useState<FigureColor | null>(null);
  const [availableColors, setAvailableColors] = useState<FigureColor[]>([FigureColor.White, FigureColor.Black]);
  const [createJoinBool, setCreateJoinBool] = useState(false);
  const [selectedGame, setSelectedGame] = useState<Games | null>(null);

  useEffect(() => {
    const client = new Client({
      brokerURL: "ws://localhost:8080/ws",
      onConnect: () => {
        console.log("✅ Connected to WebSocket");
      },
      onDisconnect: () => console.log("❌ Disconnected from WebSocket"),
    });

    client.activate();
    setStompClient(client);

    return () => {
      client.deactivate();
    }
  }, []);

  const handleCreateGame = useCallback(async (selectedColor: FigureColor | null, selectedGamee: Games | null) => {
    if (selectedColor == null) throw new Error('Color not selected');
    console.log("Selected game: " + selectedColor);
    try {
      if (selectedGamee === Games.Chess) {
        await createChessGame(selectedColor);
      } else if (selectedGamee === Games.Othello) {
        console.log("Othelo");
        await createOthelloGame(selectedColor);
      } else {
        throw new Error("Unknown game type");
      }
    } catch (error) {
      console.error("❌ Error creating game:", error);
    }
    /*try {
      const response = await fetch("http://localhost:8080/chess/new", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: selectedColor,
      });

      if (!response.ok) throw new Error("Failed to create game");

      const gameData = await response.json();
      console.log("✅ New game created:", gameData);

      setGameId(gameData.gameId);
      if (!stompClient) return console.error("❌ WebSocket client not initialized!");
      let board = new ChessBoard();
      const newGame = GameFactory.createGame("chess", gameData.gameId, stompClient, board, selectedColor);
      board.setGame(newGame);
      setChessGame(newGame);
      setBoardContent(await newGame.startGame(gameData.gameId, gameData.chessBoard));
      setShowColors(false);
      setShowGameOptions(false);
      setShowGames(false);


      // ✅ Přihlásíme se k odběru herních updatů
      stompClient.subscribe(`/topic/game/${gameData.gameId}`, (message) => {
        const gameState = JSON.parse(message.body);
        console.log("♟️ Game update received:", gameState);
        if (Array.isArray(gameState.chessBoard)) {
          newGame.getBoard().updateBoard(gameState.chessBoard);
          if (gameState.winner != null) {
            newGame.gameEnd(gameState.winner);
          }
          newGame.setCurrentPlayer(gameState.isPlaying);
        }
      });
    } catch (error) {
      console.error("❌ Error creating game:", error);
    }*/
  }, [stompClient]);

  const createChessGame = async (selectedColor: FigureColor) => {
    const response = await fetch("http://localhost:8080/chess/new", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: selectedColor,
    });

    if (!response.ok) throw new Error("Failed to create chess game");

    const gameData = await response.json();
    console.log("✅ New chess game created:", gameData);

    setGameId(gameData.gameId);
    if (!stompClient) return console.error("❌ WebSocket client not initialized!");

    let board = new ChessBoard();
    const newGame = GameFactory.createGame("chess", gameData.gameId, stompClient, board, selectedColor);
    board.setGame(newGame);
    setChessGame(newGame);
    setBoardContent(await newGame.startGame(gameData.gameId, gameData.chessBoard));
    setShowColors(false);
    setShowGameOptions(false);
    setShowGames(false);

    stompClient.subscribe(`/topic/game/${gameData.gameId}`, (message) => {
      const gameState = JSON.parse(message.body);
      console.log("♟️ Chess game update received:", gameState);
      if (Array.isArray(gameState.chessBoard)) {
        newGame.getBoard().updateBoard(gameState.chessBoard);
        if (gameState.winner != null) {
          newGame.gameEnd(gameState.winner);
        }
        newGame.setCurrentPlayer(gameState.isPlaying);
      }
    });
  };


  const createOthelloGame = async (selectedColor: FigureColor) => {
    const response = await fetch("http://localhost:8080/othello/new", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: selectedColor,
    });

    if (!response.ok) throw new Error("Failed to create chess game");

    const gameData = await response.json();
    console.log("✅ New othello game created:", gameData);

    setGameId(gameData.gameId);
    if (!stompClient) return console.error("❌ WebSocket client not initialized!");
    let board = new OthelloBoard();
    const newGame = GameFactory.createGame("othello", gameData.gameId, stompClient, board, selectedColor);
    board.setGame(newGame);
    setChessGame(newGame);
    setBoardContent(await newGame.startGame(gameData.gameId, gameData.othelloBoard));
    setShowColors(false);
    setShowGameOptions(false);;
    setShowGames(false);

    stompClient.subscribe(`/topic/game/${gameData.gameId}`, (message) => {
      const gameState = JSON.parse(message.body);
      console.log("Othello game update received:", gameState);
      if (Array.isArray(gameState.chessBoard)) {
        newGame.getBoard().updateBoard(gameState.chessBoard);
        if (gameState.winner != null) {
          newGame.gameEnd(gameState.winner);
        }
        newGame.setCurrentPlayer(gameState.isPlaying);
      }
    });
  };

  // ✅ Funkce pro připojení ke hře
  const handleColors = useCallback(async () => {
    if (!gameId) return;

    try {
      const response = await fetch(`http://localhost:8080/chess/${gameId}`);
      if (!response.ok) throw new Error("Game not found");

      const gameData = await response.json();
      console.log("✅ Joined game:", gameData);

      if (!stompClient) return console.error("❌ WebSocket client not initialized!");
      // 📌 Nastavíme dostupné barvy pro výběr a zobrazíme okno
      setAvailableColors(gameData.restOfColors);
      setCreateJoinBool(true);
      setShowColors(true);
    } catch (error) {
      console.error("❌ Error joining game:", error);
    }
  }, [gameId, stompClient]);

  const handleGameJoin = async (color: FigureColor | null) => {
    if (!gameId) return;

    try {
      const response = await fetch(`http://localhost:8080/chess/join/${gameId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: color,
      });

      if (!response.ok) throw new Error("Failed to choose color");

      const gameData = await response.json();
      console.log("✅ Color chosen:", gameData);
      if (!stompClient) return console.error("❌ WebSocket client not initialized!");
      let board = new ChessBoard();
      const newGame = GameFactory.createGame("chess", gameId, stompClient, board, color);
      board.setGame(newGame);
      newGame.setCurrentPlayer(gameData.isPlaying);
      setChessGame(newGame);
      setBoardContent(await newGame.startGame(gameData.gameId, gameData.chessBoard));

      setShowColors(false);
      setShowGameOptions(false);
      setShowGames(false);

      stompClient.subscribe(`/topic/game/${gameData.gameId}`, (message) => {
        const gameState = JSON.parse(message.body);
        console.log("♟️ Game update received:", gameState);
        if (Array.isArray(gameState.chessBoard)) {
          newGame.getBoard().updateBoard(gameState.chessBoard);
          if (gameState.winner != null) {
            newGame.gameEnd(gameState.winner);
          }
          newGame.setCurrentPlayer(gameState.isPlaying);
        }
      });
    } catch (error) {
      console.error("❌ Error selecting color:", error);
    }
  };

  useEffect(() => {
    if (chessGame && boardContent && !chessGame.getBoard().getRendered()) {
      chessGame.getBoard().addPieceImageLoop();
    }
  }, [chessGame, boardContent]);

  return (
    <div className="app">
      <button onClick={() => setShowGames(!showGames)}>Hry</button>
      {showGames && (
        <div>
          <button onClick={() => { setSelectedGame(Games.Chess); setShowGameOptions(!showGameOptions) }}>Šachy</button>
          <button onClick={() => setShowGameOptions(!showGameOptions)}>Dáma</button>
          <button onClick={() => { setSelectedGame(Games.Othello); setShowGameOptions(!showGameOptions) }}>Othello</button>
        </div>)
      }

      {
        showGameOptions && (
          <div className="menu">
            <button onClick={() => { setShowColors(true) }}>Vytvořit hru</button>
            <input
              type="text"
              placeholder="Zadej ID hry"
              value={gameId || ""}
              onChange={(e) => setGameId(e.target.value)}
            />
            <button onClick={handleColors}>Připojit se</button>
          </div>
        )
      }

      {
        showColors && (
          <div>
            <ColorsMenu availableColors={availableColors} onSelectColor={(color) => { setSelectedColor(color); createJoinBool ? handleGameJoin(color) : handleCreateGame(color, selectedGame); }} />
          </div>
        )
      }

      <div>{boardContent}</div>
    </div >
  );
};

export default App;
