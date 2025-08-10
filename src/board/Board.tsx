import { Piece } from '../figures/Piece';
import { AbsGame } from "../game/AbsGame";

export interface Board {
    board: (Piece | null)[][];
    game: AbsGame;
    rendered: boolean;
    getRendered(): boolean;
    setRendered(rendered: boolean): void;
    clone(): Board;
    initialize(boardDTO: ({ pieceType: string, color: string } | null)[][]): JSX.Element;
    updateBoard(boardDTO: ({ pieceType: string, color: string } | null)[][], currentPlayer: number): void;
    addPieceImageLoop(): void;

}
