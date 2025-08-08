import React, { useEffect } from "react";
import { Games } from "../eunums/Games";
import "./GameMenu.css";

interface GameMenuProps {
    setSelectedGame: (game: Games) => void;
    onClose: () => void;
}

const GameMenu: React.FC<GameMenuProps> = ({ setSelectedGame, onClose }) => {
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [onClose]);

    return (
        <div
            className="overlay"
            onClick={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
            role="dialog"
            aria-modal="true"
        >
            <div className="menu-colors-menu">
                <button className="close-btn" onClick={onClose} aria-label="Zavřít">×</button>

                <h2 className="menu-title">Vyber si hru</h2>
                <div className="buttons">
                    <button className="game-btn" onClick={() => setSelectedGame(Games.Chess)}>Šachy</button>
                    <button className="game-btn" onClick={() => setSelectedGame(Games.Othello)}>Othello</button>
                </div>
            </div>
        </div>
    );
};

export default GameMenu;