import { Piece } from '../figures/Piece';
import { OthelloGame } from '../game/OthelloGame';
import { Board } from "./Board";
import { FigureColor } from '../eunums/Color';
import { Stone } from '../figures/othello/Stone';
import { AbsGame } from '../game/AbsGame';
import ColorsMenu from '../colorMenu/ColorMenu';


export class OthelloBoard implements Board {
    board: (Piece | null)[][];
    game!: OthelloGame;
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

    updateBoard(chessBoardDTO: ({ pieceType: string, color: string } | null)[][], currentPlayer: number) {
        this.deleteCss();
        this.deletePieces();
        this.initialize(chessBoardDTO);
        this.addPieceImageLoop();
        this.game.setCurrentPlayer(currentPlayer);
    }

    initialize(othelloBoardDto: ({ pieceType: string, color: string } | null)[][]): JSX.Element {
        let board = this.createBoard();
        for (let row = 0; row < othelloBoardDto.length; row++) {
            for (let col = 0; col < othelloBoardDto[row].length; col++) {
                const pieceType = othelloBoardDto[row][col]?.pieceType;
                let color = othelloBoardDto[row][col]?.color;
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
                    this.board[row][col] = new Stone(figureColor, [row, col], this.game);
                }
            }
        }
        return board;
    }

    deletePieces() {
        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
                this.board[i][j] = null;
            }
        }
    }

    getRendered(): boolean {
        return this.rendered;
    }

    setRendered(rendered: boolean): void {
        this.rendered = rendered;
    }

    clone(): OthelloBoard {
        const newBoard = new OthelloBoard();
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

    getAllValidMoves(): [number, number][] {
        let squares: [number, number][] = [];
        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
                let possibleMoves = this.isPiecePlacable(i, j, this.game.currentPlayer)
                if (possibleMoves.length != null && possibleMoves.length > 0) {
                    squares.push([i, j]);
                }
            }
        }
        return squares;
    }

    isPiecePlacable(r: number, c: number, color: FigureColor): number[][] {
        let squares: number[][] = [];
        let directions = [
            [- 1, -1], [- 1, 0], [-1, 1],
            [0, -1], [0, 1],
            [1, -1], [1, 0], [1, 1]
        ];

        for (let [dx, dy] of directions) {
            let row = r + dx;
            let col = c + dy;
            let tempSquares: number[][] = [];

            while (this.isInBounds(row, col) && this.board[row][col] != null && this.isEnemy(row, col, color)) {
                tempSquares.push([row, col]);

                row += dx;
                col += dy;
            }

            if (this.isInBounds(row, col) && this.isAllay(row, col, color)) {
                squares.push(...tempSquares);
            }
        }
        return squares;

    }

    isInBounds(x: number, y: number): boolean {
        return x <= 7 && x >= 0 && y <= 7 && y >= 0;
    }
    isEmpty(x: number, y: number): boolean {
        if (this.isInBounds(x, y)) return this.board[x][y] == null;
        return false;
    }

    addPieceImage(piece: Piece | null): void {
        if (piece == null) return;
        const imgSrc = piece.getPieceImage(piece);
        const cellElement = document.getElementById(`${piece.position[0]}-${piece.position[1]}`);
        if (!cellElement) return;
        cellElement.innerHTML = "";
        const imgElement = document.createElement('img');
        imgElement.src = imgSrc;
        imgElement.classList.add('othello-piece');
        cellElement.appendChild(imgElement);

    }

    possibleMoves(arr: number[][]): void {
        for (let i = 0; i < arr.length; i++) {
            let stringos: string = arr[i][0] + "-" + arr[i][1];
            let square = document.getElementById(stringos);
            if (square !== null) {
                square.classList.add("possible-move");
            }
        }
    }

    deleteCss(): void {
        const highlighted = document.querySelectorAll(".possible-move");
        highlighted.forEach((el) => el.classList.remove("possible-move"));
    }


    getPiece(x: number, y: number): Piece | null {
        return this.board[x][y];
    }

    createBoard(): JSX.Element {
        return (
            <div className='othello-board-wraper'>
                <div className="othello-board">
                    {Array.from({ length: 8 }).map((_, i) => (
                        Array.from({ length: 8 }).map((_, j) => this.createNewDiv(i, j))
                    ))}
                </div>
            </div>
        );
    }

    createNewDiv(i: number, j: number): JSX.Element {
        const piece = this.board[i][j];
        const id = `${j}-${i}`;

        return (
            <div
                key={id}
                id={id}
                className="othello-cell"
                onClick={() => this.handleClick(j, i)}
            >
            </div>
        );
    }

    handleClick(x: number, y: number) {
        this.game.addStone(x, y);
    }

    setGame(game: AbsGame): void {
        if (game instanceof OthelloGame) {
            this.game = game;
        } else {
            throw 'Illegal argument';
        }
    }

    isEnemy(x: number, y: number, color: FigureColor): boolean {
        if (!this.isInBounds(x, y) || this.board[x][y] == null) return false;
        let piece = this.board[x][y];
        if (piece == null) return false;
        if (piece.color == color) return false;
        return true;
    }

    isAllay(x: number, y: number, color: FigureColor): boolean {
        if (!this.isInBounds(x, y) || this.board[x][y] == null) return false;
        let piece = this.board[x][y];
        if (piece == null) return false;
        if (piece.color != color) return false;
        return true;
    }
}