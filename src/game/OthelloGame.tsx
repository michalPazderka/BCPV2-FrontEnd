import { FigureColor } from "../eunums/Color";
import { Piece } from "../figures/Piece";
import { AbsGame } from "./AbsGame";
import { OthelloBoard } from "../board/OthelloBoard";

export class OthelloGame extends AbsGame {
    currentPlayer: FigureColor;
    playerColor: FigureColor | null;
    board: OthelloBoard
    APPM: [number, number][] | undefined;
    activePiece: Piece | null;


    constructor(stompClient: any, gameId: string, board: OthelloBoard, playerColor: FigureColor | null) {
        super(board, gameId, stompClient);
        this.playerColor = playerColor;
        this.board = board;
        this.currentPlayer = FigureColor.Black;
        this.activePiece = null;
        this.players = new Map<number, FigureColor>([
            [0, FigureColor.White],
            [1, FigureColor.Black]
        ]);
    }

    async startGame(gameId: string, chessBoardDTO: ({ pieceType: string, color: string } | null)[][]): Promise<JSX.Element> {
        try {
            this.gameId = gameId;
            return this.board.initialize(chessBoardDTO);
        } catch (error) {
            console.error("Error starting game:", error);
            return <div>Error loading game </div>;
        }
    }

    switchColor(color: FigureColor): FigureColor {
        if (FigureColor.White == color) {
            return FigureColor.Black
        } else {
            return FigureColor.White;
        }
    }

    async addStone(x: number, y: number): Promise<void> {
        if (this.currentPlayer !== this.playerColor) {
            return;
        }
        if (!(this.APPM && this.APPM.length > 0)) {
            this.APPM = this.board.getAllValidMoves();
            this.board.possibleMoves(this.APPM);
        }
        for (let i = 0; i < this.APPM.length; i++) {
            if (x === this.APPM[i][0] && y === this.APPM[i][1]) {
                const move = `${x}${y}`;
                if (this.stompClient && this.stompClient.connected) {
                    this.stompClient.publish({
                        destination: "/app/othello/move",
                        body: JSON.stringify({ gameId: this.gameId, move: move }),
                    });
                    this.APPM.length = 0;
                } else {
                    return;
                }
            }

        }

    }

    async validateMove(move: string): Promise<string> {

        if (!this.stompClient || !this.stompClient.connected) {
            console.error("❌ WebSocket not connected!");
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