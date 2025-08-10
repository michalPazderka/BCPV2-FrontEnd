import { Piece } from "../figures/Piece";

export class Move {
    from: String;
    to: String;
    piece: Piece;
    capturedPiece: Piece | null;

    constructor(from: String, to: String, piece: Piece, capturedPiece: Piece | null) {
        this.from = from;
        this.to = to;
        this.piece = piece;
        this.capturedPiece = capturedPiece;
    }

}
