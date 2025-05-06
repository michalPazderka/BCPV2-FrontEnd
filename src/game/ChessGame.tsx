import { FigureColor, GameStatus } from "../eunums/Color";
import { Piece } from "../figures/Piece";
import { AbsGame } from "./AbsGame";
import { ChessBoard } from "../board/ChessBoard";

export class ChessGame extends AbsGame {
    currentPlayer: FigureColor;
    gameStatus: GameStatus;
    playerColor: FigureColor | null;
    //moveHistory: Move[];
    board: ChessBoard
    //round: number;
    APPM: [number, number][] | undefined;
    activePiece: Piece | null;
    //materialBlack: string[];
    //materialWhite: string[];
    constructor(stompClient: any, gameId: string, board: ChessBoard, playerColor: FigureColor | null) {
        super(board, gameId, stompClient);
        this.playerColor = playerColor;
        this.board = board;
        this.currentPlayer = FigureColor.White;
        this.gameStatus = GameStatus.ONGOING;
        this.activePiece = null;
        this.players = new Map<number, FigureColor>([
            [0, FigureColor.White],
            [1, FigureColor.Black]
        ]);
        //  this.moveHistory = [];
        //this.round = 1;
        //this.materialBlack = ["pawn", "pawn", "pawn", "pawn", "pawn", "pawn", "pawn", "pawn", "rook", "rook", "bishop", "bishop", "horse", "horse", "queen"];
        //this.materialWhite = ["pawn", "pawn", "pawn", "pawn", "pawn", "pawn", "pawn", "pawn", "rook", "rook", "bishop", "bishop", "horse", "horse", "queen"];
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
                        const move = `${arr[0]}${arr[1]}${x}${y}`;

                        if (this.stompClient && this.stompClient.connected) {
                            this.stompClient.publish({
                                destination: "/app/move",
                                body: JSON.stringify({ gameId: this.gameId, move: move }),
                            });
                            console.log("📤 Move sent via WebSocket:", move);
                        } else {
                            console.error("❌ WebSocket not connected!");
                            return;
                        }

                        this.switchPlayer();
                        this.board.isCheck(this.currentPlayer);
                        this.board.isMate(this.currentPlayer);

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
            if (this.APPM.length > 0) {
                this.board.posibleMoves(this.APPM);
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

    /*getMoveHistory(from:[number,number],piece:Piece, to:[number,number], enemyPiece: Piece | null){
      let a = new Move(from,to, piece, enemyPiece);
      let b = a.createNotation();
      this.moveHistory.push(a);
      console.log(this.moveHistory);
      this.showNotation(b);
    }*/
    updateGameStatus(gameStatus: GameStatus): void {
        this.gameStatus = gameStatus;
    }
    /*showNotation(notation: string): void {
        let divNotation = document.getElementById("notation");
        if (this.currentPlayer == FigureColor.Black) {
            let newDiv = document.createElement("div");
            newDiv.className = "notation-row";
            newDiv.id = this.round.toString();
            let newParagraph = document.createElement("p");
            newParagraph.textContent = this.round + "." + notation + "   ";
            newDiv.appendChild(newParagraph);
            divNotation?.appendChild(newDiv);
        } else {
            let newDiv = document.getElementById(this.round.toString());
            let newParagraph = document.createElement("p");
            newParagraph.textContent = this.round + "." + notation;
            if (newDiv != null) {
                newDiv.appendChild(newParagraph);
                divNotation?.appendChild(newDiv);
            }
            this.round++;
        }
    }*/
    gameEnd(gameEnd: string): void {
        if (gameEnd == "DRAW") {
            alert("Hra skončila remízou");
        } else {
            alert("Vyhrává: " + gameEnd);
        }
    }
    /*materialCounting(piece: Piece): void {
        let color = piece.color;
        let name = piece.type
        if (color == FigureColor.Black) {
            let indexToRemove = this.materialBlack.indexOf(name);
            this.materialBlack.splice(indexToRemove, 1);
        } else {
            let indexToRemove = this.materialWhite.indexOf(name);
            this.materialWhite.splice(indexToRemove, 1);
        }
        let black: boolean = this.countMaterial(FigureColor.Black);
        let white: boolean = this.countMaterial(FigureColor.White);
        if (white && black) {
            this.gameEndedDraw();
        }
    }
    countMaterial(color: FigureColor): boolean {
        let material;
        if (color == FigureColor.White) {
            material = this.materialWhite;
        } else {
            material = this.materialBlack;
        }
        const numBishops = material.filter(name => name.includes("bishop")).length;
        const numRooks = material.filter(name => name.includes("rook")).length;
        const numHorses = material.filter(name => name.includes("horse")).length;
        const numQuenns = material.filter(name => name.includes("quenn")).length;
        const numPawn = material.filter(name => name.includes("pawn")).length;
        if (numBishops > 1 || numRooks > 0 || numQuenns > 0 || numPawn > 0) {
            return false;
        }
        if (numBishops === 1 && numHorses === 1) {
            return false;
        }
        return true;
    }*/


    async validateMove(move: string): Promise<string> {
        console.log("📤 Sending move:", move);

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