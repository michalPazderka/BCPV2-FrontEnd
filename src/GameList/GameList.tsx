import React, { useEffect, useState } from "react";
import "./GameList.css";

interface GameInfo {
    id: string;
    numberOfFreePlaces: number;
    gameName: string;
}

interface GameListProps {
    onJoinGame: (gameId: string) => void;
    onCreateGame: () => void;
}

const GameList: React.FC<GameListProps> = ({ onJoinGame, onCreateGame }) => {
    const [games, setGames] = useState<GameInfo[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchGames = async () => {
            try {
                const res = await fetch('http://localhost:8080/general');
                const data = await res.json();
                setGames(data.content);
            } catch (err) {
                console.error("failed", err);
            } finally {
                setLoading(false);
            }
        };
        fetchGames();
    }, []);
    return (
        <div className="game-list">
            <div className="game-list-header">
                <h3>Dostupné hry</h3>
                <button className="button" onClick={onCreateGame}>Vytvořit hru</button>
            </div>

            {loading ? (
                <p>Načítání her...</p>
            ) : games.length === 0 ? (
                <p>Žádné otevřené hry.</p>
            ) : (
                games.map((game) => (
                    <div key={game.id} className="game-card">
                        <p><strong>Typ hry:</strong> {game.gameName}</p>
                        <p><strong>Volné místa:</strong> {game.numberOfFreePlaces}</p>
                        <p><strong>ID:</strong> {game.id}</p>
                        <button className="game-btn" onClick={() => onJoinGame(game.id)}>Připojit se</button>
                    </div>
                ))
            )}
        </div>
    );
}

export default GameList;