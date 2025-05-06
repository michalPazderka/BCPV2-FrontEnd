import React from "react";
import "./ColorMenu.css";
import { FigureColor } from "../eunums/Color";

interface ColorsMenuProps {
    availableColors: FigureColor[];
    onSelectColor: (color: FigureColor | null) => void;
}

const ColorsMenu: React.FC<ColorsMenuProps> = ({ availableColors, onSelectColor }) => {
    return (
        <div className="overlay">
            <div className="menu">
                <h2>Vyber si barvu</h2>
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
