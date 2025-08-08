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
import GameList from "./GameList/GameList";
import GameMenu from "./gameMenu/GameMenu";


const App: React.FC = () => {
  const [boardContent, setBoardContent] = useState<JSX.Element | null>(null);
  const [game, setGame] = useState<AbsGame | null>(null);
  const [gameId, setGameId] = useState<string | null>(null);
  const [showGames, setShowGames] = useState(false);
  const [showGameOptions, setShowGameOptions] = useState(false);
  const [showColors, setShowColors] = useState(false);
  const [stompClient, setStompClient] = useState<Client | null>(null);
  const [selectedColor, setSelectedColor] = useState<FigureColor | null>(null);
  const [availableColors, setAvailableColors] = useState<FigureColor[]>([FigureColor.White, FigureColor.Black]);
  const [createJoinBool, setCreateJoinBool] = useState(false);
  const [selectedGame, setSelectedGame] = useState<Games | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [winner, setWinner] = useState<string | null>(null);

  useEffect(() => {
    let playerId = localStorage.getItem("playerId");
    if (!playerId) {
      playerId = crypto.randomUUID();
      localStorage.setItem("playerId", playerId);
    }
    console.log(localStorage.getItem("gameId"));
    console.log(localStorage.getItem("gameColor"));
    const client = new Client({
      brokerURL: "ws://localhost:8080/ws",
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      reconnectDelay: 5000,
      connectHeaders: {
        gameId: localStorage.getItem("gameId") ?? "",
        playerId: localStorage.getItem("playerId") ?? "",
      },
      onConnect: () => {
        console.log("✅ Connected to WebSocket");
        setStompClient(client);

        const savedGameId = localStorage.getItem("gameId");
        const savedColor = localStorage.getItem("color");

        if (savedGameId) {
          setGameId(savedGameId);
          console.log(gameId);
          reconnectToGame(savedColor as FigureColor, savedGameId, client);
        }
      },
      onDisconnect: () => console.log("❌ Disconnected from WebSocket"),
    });

    client.activate();

    return () => {
      client.deactivate();
    }
  }, []);

  useEffect(() => {
    if (winner) {
      const timer = setTimeout(() => {
        setBoardContent(null);
        setWinner(null);
      }, 10000);

      return () => clearTimeout(timer);
    }
  }, [winner]);

  const showToast = (message: string, duration = 3000) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, duration);
  }

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
  }, [stompClient]);

  const createChessGame = async (selectedColor: FigureColor) => {
    try {

      const response = await fetch("http://localhost:8080/chess/new", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: selectedColor,
      });

      if (!response.ok) {
        const errorText = await response.text();
        showToast(`Chyba: ${errorText || response.statusText}`);
        return;
      }
      const gameData = await response.json();
      console.log("✅ New chess game created:", gameData);


      setGameId(gameData.gameId);
      if (!stompClient) {
        showToast("WebSocket není připojen");
        return;
      }

      let board = new ChessBoard();
      const newGame = GameFactory.createGame("chess", gameData.gameId, stompClient, board, selectedColor);
      board.setGame(newGame);
      setGame(newGame);
      setBoardContent(await newGame.startGame(gameData.gameId, gameData.board));
      setShowColors(false);
      setShowGameOptions(false);
      setShowGames(false);

      if (gameData.gameId) {
        localStorage.setItem("gameId", gameData.gameId);
        localStorage.setItem("color", selectedColor);
        console.log(localStorage.getItem("color"));
      }

      stompClient.subscribe(`/topic/game/${gameData.gameId}`, (message) => {
        const gameState = JSON.parse(message.body);
        console.log("♟️ Chess game update received:", gameState);
        if (Array.isArray(gameState.board)) {
          newGame.getBoard().updateBoard(gameState.board, gameState.isPlaying);
          if (gameState.winner != null) {
            setWinner(gameState.winner);
            localStorage.removeItem("gameId");
            localStorage.removeItem("color");
          }
          newGame.setCurrentPlayer(gameState.isPlaying);
        }
      });
    } catch (error) {
      showToast("Nepodařilo se vytvořit hru");
    }
  };


  const createOthelloGame = async (selectedColor: FigureColor) => {
    try {

      const response = await fetch("http://localhost:8080/othello/new", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: selectedColor,
      });

      if (!response.ok) {
        const errorText = await response.text();
        showToast(`Chyba: ${errorText || response.statusText}`);
        return;
      }

      const gameData = await response.json();
      console.log("✅ New othello game created:", gameData);
      let gameId = gameData.gameId;

      setGameId(gameData.gameId);
      if (!stompClient) {
        showToast("WebSocket není připojen");
        return;
      }

      let board = new OthelloBoard();
      const newGame = GameFactory.createGame("othello", gameData.gameId, stompClient, board, selectedColor);
      board.setGame(newGame);
      setGame(newGame);
      setBoardContent(await newGame.startGame(gameData.gameId, gameData.board));
      setShowColors(false);
      setShowGameOptions(false);
      setShowGames(false);

      if (gameId) {
        localStorage.setItem("gameId", gameId);
        localStorage.setItem("color", selectedColor);
        console.log(localStorage.getItem("color"));
      }

      stompClient.subscribe(`/topic/game/${gameData.gameId}`, (message) => {
        const gameState = JSON.parse(message.body);
        if (Array.isArray(gameState.board)) {
          console.log(gameState);
          newGame.getBoard().updateBoard(gameState.board, gameState.isPlaying);
          if (gameState.winner != null) {
            setWinner(gameState.winner);
            localStorage.removeItem("gameId");
            localStorage.removeItem("color");
          }
          newGame.setCurrentPlayer(gameState.isPlaying);
        }
      });
    } catch {
      showToast("Nepodařilo se vytvořit hru");
    }
  };

  const handleColors = useCallback(async () => {
    if (!gameId) return;

    try {
      const response = await fetch(`http://localhost:8080/general/${gameId}`);
      if (!response.ok) throw new Error("Game not found");

      const gameData = await response.json();
      console.log("✅ Joined game:", gameData);

      if (!stompClient) {
        showToast("WebSocket není připojen")
        return;
      }
      console.log(gameData.game);
      setSelectedGame(gameData.game.toUpperCase());
      console.log(selectedGame);
      setAvailableColors(gameData.restOfColors);
      setCreateJoinBool(true);
      setShowColors(true);
    } catch (error) {
      showToast("Nepodařilo se připojit ke hře")
    }
  }, [gameId, stompClient]);

  const handleGameJoin = async (color: FigureColor | null) => {
    if (!gameId) return;

    try {
      let string;
      if (selectedGame == Games.Chess) {
        string = "chess";
      } else if (selectedGame == Games.Othello) {
        string = "othello";
      } else throw new Error("Game does not exist");

      const response = await fetch(`http://localhost:8080/${string}/join/${gameId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: color,
      });

      if (!response.ok) {
        localStorage.removeItem("gameId");
        localStorage.removeItem("color");
        throw new Error("Failed to choose color");
      }


      const gameData = await response.json();
      console.log("✅ Color chosen:", gameData);
      if (!stompClient) {
        showToast("WebSocket není připojen");
        return;
      }
      let board;
      if (string == "chess") {
        board = new ChessBoard();
      } else if (string == "othello") {
        board = new OthelloBoard();
      } else throw new Error("Game does not exist");
      const newGame = GameFactory.createGame(string, gameId, stompClient, board, color);
      board.setGame(newGame);
      newGame.setCurrentPlayer(gameData.isPlaying);
      setGame(newGame);
      setBoardContent(await newGame.startGame(gameData.gameId, gameData.board));

      setShowColors(false);
      setShowGameOptions(false);
      setShowGames(false);
      console.log(gameId);
      console.log(color);
      if (gameId && color) {
        localStorage.setItem("gameId", gameId);
        localStorage.setItem("color", color);
      }

      stompClient.subscribe(`/topic/game/${gameData.gameId}`, (message) => {
        const gameState = JSON.parse(message.body);
        if (Array.isArray(gameState.board)) {
          newGame.getBoard().updateBoard(gameState.board, gameState.isPlaying);
          if (gameState.winner != null) {
            setWinner(gameState.winner);
            localStorage.removeItem("gameId");
            localStorage.removeItem("color");
          }
          newGame.setCurrentPlayer(gameState.isPlaying);
        }
      });
    } catch (error) {
      showToast("Nepodařilo se připojit ke hře")
    }
  };

  const reconnectToGame = async (color: FigureColor | null, gameId: string, client: Client) => {

    try {
      const response = await fetch(`http://localhost:8080/general/${gameId}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" }
      });
      if (!response.ok) {
        console.warn("Failed to choose color");
        localStorage.removeItem("gameId");
        localStorage.removeItem("color");
        return;
      }

      const gameData = await response.json();
      console.log(gameData);
      console.log(gameData.game);
      if (!client) {
        showToast("WebSocket není připojen");
        return;
      }
      let string;
      if (gameData.game.toUpperCase() == Games.Chess) {
        string = "chess";
      } else if (gameData.game.toUpperCase() == Games.Othello) {
        string = "othello";
      } else throw new Error("Game does not exist");

      let board;
      if (string == "chess") {
        board = new ChessBoard();
      } else if (string == "othello") {
        board = new OthelloBoard();
      } else throw new Error("Game does not exist");
      const newGame = GameFactory.createGame(string, gameId, client, board, color);
      board.setGame(newGame);
      newGame.setCurrentPlayer(gameData.isPlaying);
      setGame(newGame);
      setBoardContent(await newGame.startGame(gameData.gameId, gameData.board));
      setShowColors(false);
      setShowGameOptions(false);
      setShowGames(false);


      client.subscribe(`/topic/game/${gameData.gameId}`, (message) => {
        const gameState = JSON.parse(message.body);
        if (Array.isArray(gameState.board)) {
          newGame.getBoard().updateBoard(gameState.board, gameState.isPlaying);
          if (gameState.winner != null) {
            setWinner(gameState.winner);
            localStorage.removeItem("gameId");
            localStorage.removeItem("color");
          }
          newGame.setCurrentPlayer(gameState.isPlaying);
        }
      });
    } catch (error) {
      showToast("Hra již neexistuje");
    }
  };

  useEffect(() => {
    if (game && boardContent && !game.getBoard().getRendered()) {
      game.getBoard().addPieceImageLoop();
    }
  }, [game, boardContent]);



  return (
    <div className="app">
      {toastMessage && (
        <div className="toast">
          {toastMessage}
        </div>
      )

      }
      <div className="menu">
        <button className="button" onClick={() => setShowGames(!showGames)}>Hry</button>
      </div>
      {showGames && (!boardContent) && (
        <div>
          <div className="menu">
            <input
              type="text"
              placeholder="Zadej ID hry"
              value={gameId || ""}
              onChange={(e) => setGameId(e.target.value)}
            />
            <button className="button" onClick={handleColors}>Připojit se</button>
          </div>
          {
            <GameList onJoinGame={(gameId) => {
              setGameId(gameId);
              handleColors();
            }}
              onCreateGame={() => { setShowGameOptions(!showGameOptions) }}
            />
          }
        </div>)
      }
      {
        (showGameOptions) && (
          < GameMenu setSelectedGame={(game) => {
            setSelectedGame(game);
            setShowColors(!showColors);
            setShowGameOptions(!showGameOptions);
          }} onClose={() => setShowGameOptions(false)}
          />
        )
      }
      {
        (showColors) && (
          <div>
            <ColorsMenu availableColors={availableColors} onSelectColor={(color) => { setSelectedColor(color); createJoinBool ? handleGameJoin(color) : handleCreateGame(color, selectedGame); }} onClose={() => setShowColors(false)} />
          </div>
        )
      }
      <div>{boardContent}</div>
      {
        (winner) && (
          <div className="winner-banner">
            {winner === "draw" ? "Remiza" : `Vyhravá: ${winner}`}
          </div>
        )
      }
    </div >
  );
};

export default App;
