import React from "react";
import { Piece } from "./Piece";
import { ChessBoard } from "../board/ChessBoard";
import { FigureColor, FigureType } from "../eunums/Color";
import { ChessGame } from "../game/ChessGame";

export class Knight implements Piece {
  type: FigureType;
  color: FigureColor;
  position: [number, number];
  img = document.createElement("img");
  game: ChessGame;
  constructor(color: FigureColor, position: [number, number], game: ChessGame) {
    this.type = FigureType.Knight;
    this.color = color;
    this.position = position;
    this.game = game;
  }
  clone(): Piece {
    return new Knight(this.color, [...this.position] as [number, number], this.game);
  }
  getPossibleMoves(board: ChessBoard): [number, number][] {
    let moves: [number, number][] = [];
    let posible: [number, number][] = [[1, 2], [2, 1], [1, -2], [2, -1], [-1, 2], [-2, 1], [-2, -1], [-1, -2]];
    for (let [dx, dy] of posible) {
      let x = this.position[0] + dx;
      let y = this.position[1] + dy;
      if (board.isInBounds(x, y) && board.isEmpty(x, y) || board.isEnemy(x, y, this.color)) {
        if (this.game.board.changePostion([x, y], this.position)) {
          moves.push([x, y]);
        }
      }
    }
    return moves;
  }
  getTheoreticalPosibleMoves(tempBoard: ChessBoard): [number, number][] {
    let moves: [number, number][] = [];
    let posible: [number, number][] = [[1, 2], [2, 1], [1, -2], [2, -1], [-1, 2], [-2, 1], [-2, -1], [-1, -2]];
    for (let [dx, dy] of posible) {
      let x = this.position[0] + dx;
      let y = this.position[1] + dy;
      if (tempBoard.isInBounds(x, y) && tempBoard.isEmpty(x, y) || tempBoard.isEnemy(x, y, this.color)) {
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