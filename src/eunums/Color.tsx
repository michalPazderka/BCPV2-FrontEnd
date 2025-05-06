export enum FigureColor {
    White = 'WHITE',
    Black = 'BLACK',
}

export enum FigureType {
    Pawn = 'PAWN',
    Bishop = 'BISHOP',
    Knight = 'KNIGHT',
    Rook = 'ROOK',
    Quenn = 'QUEEN',
    King = 'KING',
    Checker = "CHECKER"
}

export enum GameStatus {
    ONGOING,
    CHECK,
    CHECKMATE,
    STALEMATE,
    DRAW
}
