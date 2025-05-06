import { Piece } from '../figures/Piece';
import { FigureColor, GameStatus } from "../eunums/Color";
import { Pawn } from "../figures/Pawn";
import { Bishop } from "../figures/Bishop";
import { ChessGame } from "../game/ChessGame";
import { Rook } from "../figures/Rook";
import { Knight } from "../figures/Knight";
import { Quenn } from "../figures/Quenn";
import { King } from "../figures/King";
import { Board } from "./Board";
import { AbsGame } from "../game/AbsGame";

export class ChessBoard implements Board {
    board: (Piece | null)[][];
    game!: ChessGame;
    APPM: [number, number][] | undefined;
    activePiece: Piece | null;
    rendered: boolean;



    constructor() {
        this.activePiece = null;
        this.board = new Array(8);
        for (let i = 0; i < 8; i++) {
            this.board[i] = new Array(8).fill(null);
        }
        this.rendered = false;
    }
    getRendered(): boolean {
        return this.rendered;
    }

    setRendered(rendered: boolean): void {
        this.rendered = rendered;
    }

    setGame(game: AbsGame): void {
        if (game instanceof ChessGame) {
            this.game = game;
        } else {
            throw 'Illegal argument';
        }
    }

    isCheck(color: FigureColor): boolean {
        let king = this.getKing(color);
        if (king != null) {
            let b = this.getEveryMove(this.changeColor(this.game.currentPlayer));
            for (let [x, y] of b) {
                if (king.position[0] == x && king.position[1] == y) {
                    return true;
                }
            }
        }
        return false;
    }
    isTheoreticalCheck(color: FigureColor, tempBoard: ChessBoard) {
        let king = tempBoard.getKing(color);
        if (king != null) {
            let b = this.getEveryTheoreticalMove(tempBoard.changeColor(this.game.currentPlayer), tempBoard);
            for (let [x, y] of b) {
                if (king.position[0] == x && king.position[1] == y) {
                    return true;
                }
            }
        }
        return false;
    }
    isMate(color: FigureColor) {
        let a = this.getEveryMove(color);

        if (a.length == 0 && this.isCheck(color)) {
            this.game.updateGameStatus(GameStatus.CHECKMATE);
            //this.game.stopGame();
        } else if (a.length == 0 && !this.isCheck(color)) {
            this.game.updateGameStatus(GameStatus.STALEMATE);
            //this.game.gameEndedDraw();
        }
    }
    getEveryMove(color: FigureColor): [number, number][] {
        let arr: [number, number][] = [];
        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
                let piece = this.getPiece(i, j);
                if (piece?.color == color) {
                    let pm = piece?.getPossibleMoves(this);
                    if (pm) {
                        for (let x of pm) {
                            let existsInArray = arr.some(a => a[0] === x[0] && a[1] === x[1]);
                            if (!existsInArray) {
                                arr.push(x);
                            }
                        }
                    }
                }
            }
        }
        return arr;
    }
    getEveryTheoreticalMove(color: FigureColor, tempBoard: ChessBoard): [number, number][] {
        let arr: [number, number][] = [];
        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
                let piece = tempBoard.getPiece(i, j);
                if (piece?.color == color) {
                    let pm = piece?.getTheoreticalPosibleMoves(tempBoard);
                    if (pm) {
                        for (let x of pm) {
                            let existsInArray = arr.some(a => a[0] === x[0] && a[1] === x[1]);
                            if (!existsInArray) {
                                arr.push(x);
                            }
                        }
                    }
                }
            }
        }
        return arr;
    }

    isSquereUnderAttack(x: number, y: number, color: FigureColor) {
        let everyMove = this.getEveryTheoreticalMove(color, this);
        for (let move of everyMove) {
            if (move[0] == x && move[1] == y) {
                return true;
            }
        }
        return false;
    }
    /*checkIfMovePromote(x: number, y: number, piece: Piece): void {
        if (piece.type != "PAWN") return;
        if (x == 7 || x == 0) this.promote(x, y, piece.color);
    }*/

    updateBoard(chessBoardDTO: ({ pieceType: string, color: string } | null)[][]) {
        console.log("♟️ Updating board with data:", chessBoardDTO);
        this.deletePieces();
        this.initialize(chessBoardDTO);
        this.addPieceImageLoop();
    }

    clone(): ChessBoard {
        const newBoard = new ChessBoard();
        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
                if (this.board[i][j] === null) {
                    newBoard.board[i][j] = null;
                } else {
                    newBoard.board[i][j] = this.board[i][j]!.clone();
                }
            }
        }
        return newBoard;
    }

    changeColor(color: FigureColor) {
        if (color == FigureColor.White) return FigureColor.Black;
        return FigureColor.White;
    }
    isInBounds(x: number, y: number): boolean {
        return x <= 7 && x >= 0 && y <= 7 && y >= 0;
    }
    isEmpty(x: number, y: number): boolean {
        if (this.isInBounds(x, y)) return this.board[x][y] == null;
        return false;
    }
    isAllay(x: number, y: number, color: FigureColor): boolean {
        if (!this.isInBounds(x, y) || this.board[x][y] == null) return false;
        let piece = this.board[x][y];
        if (piece == null) return false;
        if (piece.color != color) return false;
        return true;
    }
    isEnemy(x: number, y: number, color: FigureColor): boolean {
        if (!this.isInBounds(x, y) || this.board[x][y] == null) return false;
        let piece = this.board[x][y];
        if (piece == null) return false;
        if (piece.color == color) return false;
        return true;
    }
    initialize(chessBoardDTO: ({ pieceType: string, color: string } | null)[][]): JSX.Element {
        let board = this.createBoard();
        for (let row = 0; row < chessBoardDTO.length; row++) {
            for (let col = 0; col < chessBoardDTO[row].length; col++) {
                const pieceType = chessBoardDTO[row][col]?.pieceType;
                let color = chessBoardDTO[row][col]?.color;
                let figureColor;
                if (color === null || color == undefined) {
                    this.board[row][col] = null;
                } else {
                    if (color.toUpperCase() == "WHITE") {
                        figureColor = FigureColor.White;
                    } else {
                        figureColor = FigureColor.Black;
                    }
                }
                if ((pieceType === null || pieceType === undefined) || (figureColor === null || figureColor === undefined)) {
                    this.board[row][col] = null;
                } else {
                    switch (pieceType.toUpperCase()) {
                        case "PAWN":
                            this.board[row][col] = new Pawn(figureColor, [row, col], this.game);
                            break;
                        case "ROOK":
                            this.board[row][col] = new Rook(figureColor, [row, col], this.game);
                            break;
                        case "KNIGHT":
                            this.board[row][col] = new Knight(figureColor, [row, col], this.game);
                            break;
                        case "BISHOP":
                            this.board[row][col] = new Bishop(figureColor, [row, col], this.game);
                            break;
                        case "QUEEN":
                            this.board[row][col] = new Quenn(figureColor, [row, col], this.game);
                            break;
                        case "KING":
                            this.board[row][col] = new King(figureColor, [row, col], this.game);
                            break;
                        default:
                            this.board[row][col] = null;
                            break;
                    }
                }
            }
        }
        return board;
    }
    addPieceImageLoop(): void {
        this.deletePiecesImage();
        for (let indexOne = 0; indexOne < 8; indexOne++) {
            for (let indexTwo = 0; indexTwo < 8; indexTwo++) {
                const piece = this.getPiece(indexOne, indexTwo);
                this.addPieceImage(piece);
            }
        }
        this.rendered = true;
    }
    addPieceImage(piece: Piece | null): void {
        if (piece == null) return;
        const imgSrc = piece.getPieceImage(piece);
        const imgElement = document.createElement('img');
        imgElement.src = imgSrc;
        imgElement.classList.add('chess-piece');
        const cellElement = document.getElementById(`${piece.position[0]}-${piece.position[1]}`);
        if (cellElement !== null) {
            cellElement.appendChild(imgElement);
        }
    }

    getPiece(x: number, y: number): Piece | null {
        return this.board[x][y];
    }
    posibleMoves(arr: number[][]): void {
        for (let i = 0; i < arr.length; i++) {
            let stringos: string = arr[i][0] + "-" + arr[i][1];
            let id = document.getElementById(stringos);
            if (id !== null) {
                id.style.backgroundColor = "red";
            }
        }
    }
    movePiece(x: number, y: number, piece: Piece): void {
        let arr = piece.getPiecePosition();
        if (this.isEnemy(x, y, piece.getColor())) {
            let enemyPiece = this.getPiece(x, y);
            this.destroyPiece(x, y);
            this.deletePiece(x, y);
            //this.game.materialCounting(enemyPiece!);
        }
        const pieceDirection = piece.color == FigureColor.White ? 1 : -1;
        if (piece.type == "PAWN" && this.isEnemy(x - pieceDirection, y, piece.getColor())) {
            let enemyPiece = this.getPiece(x - pieceDirection, y);
            this.destroyPiece(x - pieceDirection, y);
            this.deletePiece(x - pieceDirection, y);
            //this.game.materialCounting(enemyPiece!);
        }
        this.deletePiece(arr[0], arr[1]);
        this.destroyPiece(arr[0], arr[1]);
        this.board[arr[0]][arr[1]] = null;
        this.board[x][y] = piece;
        this.updatePiece(x, y, piece);
        piece.setPiecePosition(x, y);
    }
    setPiecePosition(x: number, y: number, piece: Piece, tempBoard: ChessBoard) {
        let arr = piece.getPiecePosition();
        if (tempBoard.isEnemy(x, y, piece.getColor())) {
            tempBoard.destroyPiece(x, y);
        }
        tempBoard.board[arr[0]][arr[1]] = null;
        tempBoard.board[x][y] = piece;
        piece.setPiecePosition(x, y);
    }
    deleteCss(): void {
        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
                let stringos: string = i + "-" + j;
                let id = document.getElementById(stringos);
                if (id !== null) {
                    id.style.backgroundColor = "";
                }
            }
        }
    }
    destroyPiece(x: number, y: number) {
        this.board[x][y] = null;
    }
    deletePiece(x: number, y: number): void {
        const div = document.getElementById(`${x}-${y}`);
        let img = div?.querySelector('img');
        if (img) {
            img.remove();
        }
    }
    updatePiece(x: number, y: number, piece: Piece): void {
        let div = document.getElementById(`${x}-${y}`);
        const imgSrc = piece.getPieceImage(piece);
        const imgElement = document.createElement('img');
        imgElement.src = imgSrc;
        imgElement.classList.add('chess-piece');
        const cellElement = document.getElementById(`${x}-${y}`);
        if (cellElement !== null) {
            cellElement.appendChild(imgElement);
        }
    }
    getKing(color: FigureColor): Piece | null {
        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
                let a = this.getPiece(i, j);
                if (a?.color == color && a?.type == "KING") {
                    return a;
                }
            }
        }
        return null;
    }
    isMoveCheck(color: FigureColor): boolean {
        let king = this.getKing(color);
        if (king !== null) {
            for (let i = 0; i < 8; i++) {
                for (let j = 0; j < 8; j++) {
                    let a = this.getPiece(i, j);
                    if (a !== null && color !== a.color) {
                        let b = a.getPossibleMoves(this);
                        for (let [x, y] of b) {
                            if (king.position[0] == x && king.position[1] == y) {
                                return true;

                            }
                        }
                    }
                }
            }
        }
        return false;
    }
    changePostion(posibleMoves: [number, number], position: [number, number]): boolean {
        let tempBoard = this.clone();
        let enemyPiece = tempBoard.getPiece(posibleMoves[0], posibleMoves[1]);
        let piece = tempBoard.getPiece(position[0], position[1]);
        if (enemyPiece != null && piece != null) {
            let enemyPiecePosition = enemyPiece.position;
            tempBoard.setPiecePosition(enemyPiecePosition[0], enemyPiecePosition[1], piece, tempBoard);
            let King = tempBoard.getKing(piece.color);
            if (King != null) {
                if (this.isTheoreticalCheck(King?.color, tempBoard)) {
                    return false;
                }
            }
        } else if (piece != null) {
            let posibleMove = posibleMoves;
            tempBoard.setPiecePosition(posibleMove[0], posibleMove[1], piece, tempBoard);
            let King = tempBoard.getKing(piece.color);
            if (King != null) {
                if (this.isTheoreticalCheck(King?.color, tempBoard)) {
                    return false;
                }
            }
        }
        return true;
    }
    deletePieces() {
        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
                this.board[i][j] = null;
            }
        }
    }
    deletePiecesImage() {
        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
                const div = document.getElementById(`${i}-${j}`);
                let img = div?.querySelector('img');
                if (img) {
                    img.remove();
                }
            }
        }
    }

    createBoard(): JSX.Element {
        return (
            <div className="chess-board">
                {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="board-row">
                        {Array.from({ length: 8 }).map((_, j) => this.createNewDiv(i, j))}
                    </div>
                ))}
            </div>
        );
    }

    createNewDiv(i: number, j: number): JSX.Element {
        return (
            <div
                key={`${i}-${j}`}
                id={`${j}-${i}`}
                className={(i + j) % 2 === 0 ? "squaredark" : "squarelight"}
                onClick={() => this.handleClick(j, i)}
            ></div>
        );
    }

    handleClick(x: number, y: number) {
        this.game.movePiece(x, y);
    }

}