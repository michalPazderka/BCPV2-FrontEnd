import { Piece } from "../Piece";
import { ChessBoard } from "../../board/ChessBoard";
import { FigureColor, FigureType } from "../../eunums/Color";
import { OthelloGame } from "../../game/OthelloGame"
import { OthelloBoard } from "../../board/OthelloBoard";

export class Stone implements Piece {
    type: FigureType;
    color: FigureColor;
    position: [number, number];
    game: OthelloGame;
    constructor(color: FigureColor, position: [number, number], game: OthelloGame) {
        this.type = FigureType.Checker;
        this.color = color;
        this.position = position;
        this.game = game;
    }
    clone(): Piece {
        return new Stone(this.color, [...this.position] as [number, number], this.game);
    }
    getPossibleMoves(board: OthelloBoard): [number, number][] {
        return [];
    }
    getTheoreticalPosibleMoves(tempBoard: OthelloBoard): [number, number][] {
        return [];
    }
    getPieceImage(piece: Piece): string {
        return `/img/${piece.color}-stone.png`;
    }
    setPiecePosition(x: number, y: number): void {
        this.position = [x, y];
    }
    getPiecePosition(): [number, number] {
        return this.position;
    }
    getColor(): FigureColor {
        return this.color;
    }
}