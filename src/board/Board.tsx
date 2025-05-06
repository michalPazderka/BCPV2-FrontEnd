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
    updateBoard(boardDTO: ({ pieceType: string, color: string } | null)[][]): void;
    addPieceImageLoop(): void;

    /*castleEightSide(color: FigureColor) {
        if (this.game.moveHistory.length == 0) return false;
        let rookPosition: number = color === FigureColor.White ? 1 : 8;
        for (let move of game.moveHistory) {
            let from = move.from
            if (color == move.piece.color && "king" == move.piece.type) {
                return false;
            }
            if (from[0] == rookPosition && from[1] == "h") {
                return false
            }
            const isSquareUnderAttack5 = game.isSquereUnderAttack(rookPosition - 1, 5, this.changeColor(color));
            const isSquareUnderAttack6 = game.isSquereUnderAttack(rookPosition - 1, 6, this.changeColor(color));
    
            if (isSquareUnderAttack5 || isSquareUnderAttack6) {
                return false
            }
            const isSquareEmpty5 = this.isEmpty(rookPosition - 1, 5);
            const isSquareEmpty6 = this.isEmpty(rookPosition - 1, 6);
            if (!isSquareEmpty5 || !isSquareEmpty6) {
                return false;
            }
        }
        return true;
    
    }
    castleOneSide(color: FigureColor) {
        if (game.moveHistory.length == 0) return false;
        let rookPosition: number = color === FigureColor.White ? 1 : 8;
        for (let move of game.moveHistory) {
            let from = move.from
            if (color == move.piece.color && "king" == move.piece.type) {
                return false;
            }
            if (from[0] == rookPosition && from[1] == "h") {
                return false
            }
            const isSquareUnderAttack3 = game.isSquereUnderAttack(rookPosition - 1, 3, this.changeColor(color));
            const isSquareUnderAttack2 = game.isSquereUnderAttack(rookPosition - 1, 2, this.changeColor(color));
    
            if (isSquareUnderAttack3 || isSquareUnderAttack2) {
                return false
            }
            const isSquareEmpty3 = this.isEmpty(rookPosition - 1, 3);
            const isSquareEmpty2 = this.isEmpty(rookPosition - 1, 2);
            if (!isSquareEmpty3 || !isSquareEmpty2) {
                return false;
            }
        }
        return true
    }*/
    /*castleMove(king: Piece, rookPosition: number): void {
        let direction: number = king.color == FigureColor.White ? 0 : 7;
        let rook = this.getPiece(direction, rookPosition)
        this.movePiece(direction, rookPosition == 0 ? 2 : 6, king);
        if (rook == null) return;
        this.movePiece(direction, rookPosition == 0 ? 3 : 5, rook);
    }
    promote(x: number, y: number, color: FigureColor): void {
        this.game.board.deletePiece(x, y);
        this.game.board.destroyPiece(x, y);
        this.board[x][y] = new Quenn(color, [x, y], this.game);
        this.addPieceImage(this.getPiece(x, y));
    }*/
}
