import React from "react";
import { Piece } from "./Piece";
import { ChessBoard } from "../board/ChessBoard";
import { FigureColor, FigureType } from "../eunums/Color";
import { ChessGame } from "../game/ChessGame";

export class Pawn implements Piece {
  type: FigureType;
  color: FigureColor;
  position: [number, number];
  direction: number;
  game: ChessGame;
  img = document.createElement("img");
  constructor(color: FigureColor, position: [number, number], game: ChessGame) {
    this.type = FigureType.Pawn;
    this.color = color;
    this.position = position;
    if (this.color == FigureColor.Black) {
      this.direction = -1;
    } else {
      this.direction = 1;
    }
    this.game = game;
  }
  clone(): Piece {
    return new Pawn(this.color, [...this.position] as [number, number], this.game);
  }
  getPossibleMoves(board: ChessBoard): [number, number][] {
    let moves: [number, number][] = [];
    let x = this.position[0] + this.direction;
    let y = this.position[1];
    if (board.isInBounds(x, y)) {
      if (board.isEmpty(x, y)) {
        if (this.game.board.changePostion([x, y], this.position)) {
          moves.push([x, y]);
        }
      }
      if (board.isEnemy(x, y + 1, this.color)) {
        if (this.game.board.changePostion([x, y + 1], this.position)) {
          moves.push([x, y + 1]);
        }
      }
      if (board.isEnemy(x, y - 1, this.color)) {
        if (this.game.board.changePostion([x, y - 1], this.position)) {
          moves.push([x, y - 1]);
        }
      }
      if (this.position[0] == 6 && this.color == FigureColor.Black && board.isEmpty(x - 1, y) && board.isEmpty(x, y)) {
        if (this.game.board.changePostion([x - 1, y], this.position)) {
          moves.push([x - 1, y]);
        }
      }
      if (this.position[0] == 1 && this.color == FigureColor.White && board.isEmpty(x + 1, y) && board.isEmpty(x, y)) {
        if (this.game.board.changePostion([x + 1, y], this.position)) {
          moves.push([x + 1, y]);
        }
      }
    }
    return moves;
  }
  getTheoreticalPosibleMoves(tempBoard: ChessBoard): [number, number][] {
    let moves: [number, number][] = [];
    let x = this.position[0] + this.direction;
    let y = this.position[1];
    if (tempBoard.isInBounds(x, y)) {
      if (tempBoard.isEmpty(x, y)) {
        moves.push([x, y]);
      }
      if (tempBoard.isEnemy(x, y + 1, this.color)) {
        moves.push([x, y + 1]);
      }
      if (tempBoard.isEnemy(x, y - 1, this.color)) {
        moves.push([x, y - 1]);
      }
      if (this.position[0] == 6 && this.color == FigureColor.Black && tempBoard.isEmpty(x - 1, y)) {
        moves.push([x - 1, y]);
      }
      if (this.position[0] == 1 && this.color == FigureColor.White && tempBoard.isEmpty(x + 1, y)) {
        moves.push([x + 1, y]);
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