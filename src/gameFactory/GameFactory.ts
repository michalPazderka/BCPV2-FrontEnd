import { OperationCanceledException } from "typescript";
import { AbsGame } from "../game/AbsGame";
import { ChessGame } from "../game/ChessGame"
import { Client } from "@stomp/stompjs";
import { Board } from "../board/Board";
import { ChessBoard } from "../board/ChessBoard";
import { FigureColor } from "../eunums/Color";
import { OthelloBoard } from "../board/OthelloBoard";
import { OthelloGame } from "../game/OthelloGame";

export class GameFactory {
    static createGame(gameType: string, gameId: string, stompClient: Client, board: Board, color: FigureColor | null): AbsGame {
        switch (gameType) {
            case "chess":
                if (board instanceof ChessBoard) {
                    console.log(color);
                    return new ChessGame(stompClient, gameId, board, color);
                } else {
                    throw new OperationCanceledException();
                }
            case "checkers":
            //return new Checkers(); // Implementace pro dámu
            case "othello":
                if (board instanceof OthelloBoard) {
                    console.log(color);
                    return new OthelloGame(stompClient, gameId, board, color);
                } else {
                    throw new OperationCanceledException();
                }
            default:
                throw new OperationCanceledException();
        }
    }
}

