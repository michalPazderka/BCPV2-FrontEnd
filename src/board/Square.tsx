import React from "react";
import { FigureColor, FigureType } from "../eunums/Color";
import { Board } from "./Board";

export class Square{
    color: FigureColor;
    board: Board;
    piece: FigureType|null;

    constructor(color: FigureColor, board:Board, piece?: FigureType){
        this.color = color
        this.board = board
        this.piece = piece ?? null;
    }

    getPiece(): FigureType|null{
        return this.piece
    }
    
    getColor(): FigureColor{
        return this.color
    }   
}