import { FigureColor, FigureType } from "../eunums/Color";
import { Board } from "../board/Board";
import { AbsGame } from "../game/AbsGame";

export interface Piece {
    color: FigureColor;
    type: FigureType;
    position: [x: number, y: number];
    game: AbsGame;
    getPiecePosition(): [number, number];
    getPossibleMoves(cheassBoard: Board): [number, number][];
    getTheoreticalPosibleMoves(chessboard: Board): [number, number][]
    getPieceImage(piece: Piece): string;
    getColor(): FigureColor;
    setPiecePosition(x: number, y: number): void;
    clone(): Piece;
}