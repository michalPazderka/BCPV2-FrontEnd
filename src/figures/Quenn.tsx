import React from "react";
import { Piece } from "./Piece";
import { ChessBoard } from "../board/ChessBoard";
import { FigureColor, FigureType } from "../eunums/Color";
import { ChessGame } from "../game/ChessGame";

export class Quenn implements Piece {
    type: FigureType;
    color: FigureColor;
    position: [number, number];
    img = document.createElement("img");
    game: ChessGame;
    constructor(color: FigureColor, position: [number, number], game: ChessGame) {
        this.type = FigureType.Quenn;
        this.color = color;
        this.position = position;
        this.game = game;
    }
    clone(): Piece {
        return new Quenn(this.color, [...this.position] as [number, number], this.game);
    }
    getPossibleMoves(board: ChessBoard): [number, number][] {
        let moves: [number, number][] = [];
        let posible: [number, number][] = [[0, 1], [1, 0], [-1, 0], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]];
        for (let [dx, dy] of posible) {
            let x = this.position[0] + dx;
            let y = this.position[1] + dy;
            while (board.isInBounds(x, y)) {
                if (this.game.board.isEmpty(x, y)) {
                    if (this.game.board.changePostion([x, y], this.position)) {
                        moves.push([x, y]);
                    }
                } else if (this.game.board.isAllay(x, y, this.color)) {
                    break;
                }
                else if (this.game.board.isEnemy(x, y, this.color)) {
                    if (this.game.board.changePostion([x, y], this.position)) {
                        moves.push([x, y]);
                        break;
                    }
                }
                x += dx;
                y += dy;
            }
        }
        return moves;
    }
    getTheoreticalPosibleMoves(tempBoard: ChessBoard): [number, number][] {
        let moves: [number, number][] = [];
        let posible: [number, number][] = [[0, 1], [1, 0], [-1, 0], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]];
        for (let [dx, dy] of posible) {
            let x = this.position[0] + dx;
            let y = this.position[1] + dy;
            while (tempBoard.isInBounds(x, y)) {
                if (tempBoard.isEmpty(x, y)) {
                    moves.push([x, y]);
                } else if (tempBoard.isAllay(x, y, this.color)) {
                    break;
                }
                else if (tempBoard.isEnemy(x, y, this.color)) {
                    moves.push([x, y]);
                    break;
                }
                x += dx;
                y += dy;
            }
        }
        return moves;
    }
    getPieceImage(piece: Piece): string {
        return `/img/${piece.color}-${piece.type}.png`;
    }
    setPiecePosition(x: number, y: number): void {
        this.position = [x, y];
    }
    getPiecePosition(): [number, number] {
        return this.position;
    }
    getColor(): FigureColor {
        return this.color;
    }
}