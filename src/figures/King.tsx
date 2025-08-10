import React from "react";
import { Piece } from "./Piece";
import { ChessBoard } from "../board/ChessBoard";
import { FigureColor, FigureType } from "../eunums/Color";
import { ChessGame } from "../game/ChessGame";

export class King implements Piece {
    type: FigureType;
    color: FigureColor;
    position: [number, number];
    img = document.createElement("img");
    game: ChessGame;
    constructor(color: FigureColor, position: [number, number], game: ChessGame) {
        this.type = FigureType.King;
        this.color = color;
        this.position = position;
        this.game = game;
    }
    clone(): Piece {
        return new King(this.color, [...this.position] as [number, number], this.game);
    }
    getPossibleMoves(board: ChessBoard): [number, number][] {
        let moves: [number, number][] = [];
        let posible: [number, number][] = [[0, 1], [1, 0], [-1, 0], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]];
        for (let [dx, dy] of posible) {
            let x = this.position[0] + dx;
            let y = this.position[1] + dy;
            if (board.isInBounds(x, y) && (board.isEmpty(x, y) || board.isEnemy(x, y, this.color)) && board.changePostion([x, y], this.position)) {
                moves.push([x, y]);
            }
        }
        if (board.castleEightSide(this.color)) {
            let rookPosition: number = this.color === FigureColor.White ? 0 : 7;
            moves.push([rookPosition, 6]);
        }
        if (board.castleOneSide(this.color)) {
            let rookPosition: number = this.color === FigureColor.White ? 0 : 7;
            moves.push([rookPosition, 2]);
        }
        return moves;
    }
    getTheoreticalPosibleMoves(board: ChessBoard): [number, number][] {
        let moves: [number, number][] = [];
        let posible: [number, number][] = [[0, 1], [1, 0], [-1, 0], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]];
        for (let [dx, dy] of posible) {
            let x = this.position[0] + dx;
            let y = this.position[1] + dy;
            if (board.isInBounds(x, y) && board.isEmpty(x, y) || board.isEnemy(x, y, this.color)) {
                moves.push([x, y]);
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