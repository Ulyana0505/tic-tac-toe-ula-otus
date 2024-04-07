import { GameFigure, GameStatus, MessageType } from "./common.js";

export type MessageData = MessageConnect | MessageInit | MessageSelect | MessageDrop | MessageTurn;
type MessageConnect = { type: MessageType.connect };
type MessageInit = { type: MessageType.init };
type MessageSelect = { type: MessageType.select; figure: GameFigure; id: string };
type MessageDrop = { type: MessageType.drop; figure: GameFigure; id: string };
type MessageTurn = { type: MessageType.turn; x: number; y: number };

export type MessageBoard = {
  allUsers: number;
  board: GameFigure[][];
  state: GameFigure;
  yourTurn: boolean;
};

export type GameBoard = {
  idCross: string;
  idZero: string;
  status: GameStatus;
  board: GameFigure[][];
  nextFig: GameFigure;
  nextId: string;
};
export type GameUsers = Record<string, GameUser>;
export type GameUser = { id: string; viewer: boolean };
