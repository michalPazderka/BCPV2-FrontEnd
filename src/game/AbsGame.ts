import { Board } from "../board/Board";
import { FigureColor } from "../eunums/Color";

export abstract class AbsGame {
    protected players: Map<number, FigureColor> = new Map()
    protected currentPlayerIndex: number;
    protected abstract currentPlayer: FigureColor;
    protected abstract playerColor: FigureColor | null;
    protected board: Board;
    protected gameId: string;
    protected stompClient: any;

    constructor(board: Board, gameId: string, stopmClient: any) {
        this.currentPlayerIndex = 0;
        this.gameId = gameId;
        this.stompClient = stopmClient;
        this.board = board;
    }

    switchPlayer(): void {
        this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.size;
        let player = this.players.get(this.currentPlayerIndex);
        if (player != undefined) {
            this.currentPlayer = player;
        }
    }

    getCurrentPlayer(): FigureColor {
        let figureColor = this.players.get(this.currentPlayerIndex);
        if (figureColor != undefined) {
            return figureColor;
        } else {
            throw new Error('Nedostatek hráčů');
        }
    }

    getBoard(): Board {
        return this.board;
    }

    abstract startGame(gameId: string, chessBoardDTO: ({ pieceType: string, color: string } | null)[][]): Promise<JSX.Element>;

    setCurrentPlayer(currentPlayerIndex: number) {
        this.currentPlayerIndex = currentPlayerIndex;
    }

    abstract gameEnd(gameEnd: string): void;
}
