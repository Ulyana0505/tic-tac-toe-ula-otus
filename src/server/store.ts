import { configureStore, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { GameFigure, GameStatus } from "../common.js";
import { GameBoard } from "../types.js";

const boardSlice = createSlice({
  name: "board",
  initialState: initGame(),
  reducers: {
    userDisconnected(state, action: PayloadAction<string>) {
      const id = action.payload;
      if (state.idZero === id) {
        state.idZero = "";
        state.status = GameStatus.waiting;
      }
      if (state.idCross === id) {
        state.idCross = "";
        state.status = GameStatus.waiting;
      }
      if (state.nextId === id) {
        state.nextId = "";
        state.status = GameStatus.waiting;
      }
    },
    boardInit(state) {
      const { board, nextFig, status } = initGame();
      state.idCross = state.idZero = state.nextId = "";
      state.nextFig = nextFig;
      state.board = board;
      state.status = status;
    },
    userTurn(state, action: PayloadAction<{ x: number; y: number }>) {
      const { x, y } = action.payload;
      state.board[y][x] = state.nextFig;
      if (isFinished(state.board, state.nextFig, x, y)) {
        state.status = GameStatus.finished;
        state.nextFig = GameFigure.empty;
        state.nextId = "";
      } else {
        state.nextFig = state.nextFig === GameFigure.cross ? GameFigure.zero : GameFigure.cross;
        state.nextId = nextId(state);
      }
    },
    figureSelect(state, action: PayloadAction<{ figure: GameFigure; id: string }>) {
      const { figure, id } = action.payload;
      switch (figure) {
        case GameFigure.cross: {
          if (!state.idCross) {
            state.idCross = id;
          }
          if (state.idZero === id) {
            state.idZero = "";
          }
          break;
        }
        case GameFigure.zero: {
          if (!state.idZero) {
            state.idZero = id;
          }
          if (state.idCross === id) {
            state.idCross = "";
          }
          break;
        }
      }
      if (GameFigure.zero && state.idZero) {
        state.status = GameStatus.started;
        if (!state.nextFig) {
          state.nextFig = GameFigure.cross;
        }
        state.nextId = nextId(state);
      }
    },
    figureDrop(state, action: PayloadAction<{ figure: GameFigure; id: string }>) {
      const { figure, id } = action.payload;
      switch (figure) {
        case GameFigure.cross: {
          if (state.idCross === id) {
            state.idCross = "";
          }
          break;
        }
        case GameFigure.zero: {
          if (state.idZero === id) {
            state.idZero = "";
          }
          break;
        }
      }
      state.status = GameStatus.waiting;
    }
  }
});

function initGame(): GameBoard {
  const board = Array.from({ length: 3 }).map((_) =>
    Array.from({ length: 3 }).map((_) => GameFigure.empty)
  );
  return {
    idCross: "",
    idZero: "",
    status: GameStatus.waiting,
    board,
    nextFig: GameFigure.empty,
    nextId: ""
  };
}

function isFinished(board: GameFigure[][], f: GameFigure, x: number, y: number) {
  let [col, row, diag, rdiag] = [0, 0, 0, 0];
  const n = 3;

  for (let i = 0; i < n; i++) {
    if (board[i][x] === f) col++;
    if (board[y][i] === f) row++;
    if (board[i][i] === f) diag++;
    if (board[i][n - 1 - i] === f) rdiag++;
  }
  const winner = col === n || row === n || diag === n || rdiag === n;

  let finished = true;
  board.forEach((row) => {
    row.forEach((v) => {
      if (v === GameFigure.empty) {
        finished = false;
      }
    });
  });

  return finished || winner;
}

function nextId(state: GameBoard) {
  switch (state.nextFig) {
    case GameFigure.cross: {
      return state.idCross;
    }
    case GameFigure.zero: {
      return state.idZero;
    }
    default: {
      return "";
    }
  }
}

export const { figureSelect, figureDrop, userDisconnected, userTurn, boardInit } =
  boardSlice.actions;

export const store = configureStore({
  reducer: boardSlice.reducer
});
