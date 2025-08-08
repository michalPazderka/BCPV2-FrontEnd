import React, { useEffect } from "react";
import "./ColorMenu.css";
import { FigureColor } from "../eunums/Color";

interface ColorsMenuProps {
    availableColors: FigureColor[];
    onSelectColor: (color: FigureColor | null) => void;
    onClose: () => void;
}

const ColorsMenu: React.FC<ColorsMenuProps> = ({ availableColors, onSelectColor, onClose }) => {
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

                <h2 className="menu-title">Vyber si barvu</h2>
                <div className="buttons">
                    {availableColors.includes(FigureColor.White) && (
                        <button className="white-btn" onClick={() => onSelectColor(FigureColor.White)}>Bílá</button>
                    )}
                    {availableColors.includes(FigureColor.Black) && (
                        <button className="black-btn" onClick={() => onSelectColor(FigureColor.Black)}>Černá</button>
                    )}
                </div>
            </div>
        </div>
    );
};
//<button className="spectate-btn" onClick={() => onSelectColor(null)}>Pozorovatel</button>

export default ColorsMenu;