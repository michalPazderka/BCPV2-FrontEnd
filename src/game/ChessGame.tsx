import { FigureColor, FigureType, GameStatus } from "../eunums/Color";
import { Piece } from "../figures/Piece";
import { AbsGame } from "./AbsGame";
import { ChessBoard } from "../board/ChessBoard";
import { Move } from "../move/Move"

export class ChessGame extends AbsGame {
    currentPlayer: FigureColor;
    gameStatus: GameStatus;
    playerColor: FigureColor | null;
    board: ChessBoard
    APPM: [number, number][] | undefined;
    moveHistory: Move[];
    activePiece: Piece | null;

    constructor(stompClient: any, gameId: string, board: ChessBoard, playerColor: FigureColor | null) {
        super(board, gameId, stompClient);
        this.playerColor = playerColor;
        this.board = board;
        this.currentPlayer = FigureColor.White;
        this.gameStatus = GameStatus.ONGOING;
        this.activePiece = null;
        this.moveHistory = [];
        this.players = new Map<number, FigureColor>([
            [0, FigureColor.White],
            [1, FigureColor.Black]
        ]);
    }

    addPlayers(players: Map<number, FigureColor>) {
        this.players = players;
    }

    async startGame(gameId: string, chessBoardDTO: ({ pieceType: string, color: string } | null)[][]): Promise<JSX.Element> {
        try {
            this.gameId = gameId;

            return this.board.initialize(chessBoardDTO);
        } catch (error) {
            console.error("Error starting game:", error);
            return <div>Error loading game</div>;
        }
    }
    stopGame(): void {
        alert("Vyhrává: " + this.switchColor(this.currentPlayer));
    }
    switchColor(color: FigureColor): FigureColor {
        if (FigureColor.White == color) {
            return FigureColor.Black
        } else {
            return FigureColor.White;
        }
    }
    async movePiece(x: number, y: number): Promise<void> {
        let didMove = false;
        let piece = this.board.getPiece(x, y);
        if (this.activePiece !== null) {
            this.board.deleteCss();
            if (this.APPM && this.APPM.length > 0) {
                for (let i = 0; i < this.APPM.length; i++) {
                    if (x === this.APPM[i][0] && y === this.APPM[i][1]) {
                        let arr = this.activePiece.getPiecePosition();

                        if (this.stompClient && this.stompClient.connected) {
                            const diff = arr[1] - y;
                            if (this.activePiece.type == FigureType.King && (Math.abs(diff) == 2)) {
                                const rookPosition = diff > 0 ? 0 : 7;
                                const move = `${arr[0]}${arr[1]}${x}${y}${rookPosition}`;
                                this.stompClient.publish({
                                    destination: "/app/chess/move",
                                    body: JSON.stringify({ gameId: this.gameId, move: move }),
                                });
                            } else {

                                const move = `${arr[0]}${arr[1]}${x}${y}`;
                                this.stompClient.publish({
                                    destination: "/app/chess/move",
                                    body: JSON.stringify({ gameId: this.gameId, move: move }),
                                });
                            }
                        } else {
                            return;
                        }

                        this.switchPlayer();
                        this.board.isCheck(this.currentPlayer);
                        this.board.isMate(this.currentPlayer);
                        this.moveHistory.push(new Move(`${arr[0]}${arr[1]}`, `${x}${y}`, this.activePiece, this.board.getPiece(x, y)));
                        didMove = true;
                        break;
                    }
                }
                this.deleteActivePiece();
            }
        }
        if (piece !== null && piece.color === this.currentPlayer && !didMove && this.playerColor === piece.color) {
            this.activePiece = piece;
            this.APPM = piece.getPossibleMoves(this.board);
            if (piece.type == FigureType.King) {

            }
            if (this.APPM.length > 0) {
                this.board.possibleMoves(this.APPM);
            }
        } else {
            this.board.deleteCss();
        }
    }

    deleteActivePiece(): void {
        this.APPM = undefined;
        this.activePiece = null;
        this.deleteCss();
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

    updateGameStatus(gameStatus: GameStatus): void {
        this.gameStatus = gameStatus;
    }

    async validateMove(move: string): Promise<string> {
        if (!this.stompClient || !this.stompClient.connected) {
            return "WebSocket error";
        }

        return new Promise((resolve) => {
            this.stompClient.publish({
                destination: `/app/move/${this.gameId}`,
                body: JSON.stringify({ move }),
            });

            resolve("Move sent");
        });
    }

    setCurrentPlayer(currentPlayerIndex: number) {
        this.currentPlayerIndex = currentPlayerIndex;
        let currentPlayer = this.players.get(this.currentPlayerIndex);
        if (currentPlayer != undefined) {
            this.currentPlayer = currentPlayer;
        }
    }
}