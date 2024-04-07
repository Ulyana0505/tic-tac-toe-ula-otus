import { useEffect, useState } from "react";
import { GameBoard } from "../types";
import { sendMessage, socket } from "./socket";
import styles from "./App.module.css";
import { GameFigure, GameStatus, MessageType } from "../common";
import classNames from "classnames";

function App() {
  const [data, setData] = useState<GameBoard | null>(null);

  useEffect(() => {
    socket.onMessage = setData;
    return () => {
      socket.onMessage = null;
    };
  }, []);

  if (!data) return null;

  return (
    <>
      <h2>Игра крестики-нолики</h2>
      <div className={styles.area}>
        <div className={styles.board}>
          {data.board.map((row, y) => (
            <BoardRow key={y} row={row} y={y} data={data} />
          ))}
        </div>
        <GameState data={data} />
      </div>
    </>
  );
}

function BoardRow({ row, y, data }: { row: GameFigure[]; y: number; data: GameBoard }) {
  const started = data.status === GameStatus.started;
  const yourTurn = data.nextId === socket.id;
  return (
    <div className={styles.row}>
      {row.map((value, x) => (
        <button
          key={x}
          data-x={x}
          data-y={y}
          className={classNames(styles.cell, !value && started && styles.active)}
          onClick={!value && started && yourTurn ? handleTurn : void 0}>
          {figureView(value)}
        </button>
      ))}
    </div>
  );
}

function handleTurn(e: React.MouseEvent<HTMLButtonElement>) {
  const { x, y } = (e.target as HTMLButtonElement).dataset;
  if (x && y) {
    sendMessage({ type: MessageType.turn, x: +x, y: +y });
  }
}

function figureView(value: GameFigure) {
  switch (value) {
    case GameFigure.empty: {
      return "";
    }
    case GameFigure.cross: {
      return "X";
    }
    case GameFigure.zero: {
      return "O";
    }
  }
}

function GameState({ data }: { data: GameBoard }) {
  if (data.status === GameStatus.finished) {
    return <GameFinished />;
  }

  return <FigureSelector data={data} />;
}

function GameFinished() {
  return (
    <div>
      <button onClick={handleNewGame}>Начать новую партию</button>
    </div>
  );
}

function handleNewGame() {
  sendMessage({ type: MessageType.init });
}

function FigureSelector({ data }: { data: GameBoard }) {
  let message = "";
  switch (data.status) {
    case GameStatus.waiting: {
      message = "выберите фигуру";
      break;
    }
    case GameStatus.started: {
      if (socket.id === data.idZero || socket.id === data.idCross) {
        message = data.nextId === socket.id ? "Ваш ход" : "Xод оппонента";
      } else {
        message = "наблюдаем";
      }
    }
  }

  return (
    <>
      <div>{message}</div>
      <button
        className={classNames(styles.cell, figureSelect(data.idCross))}
        data-name={GameFigure.cross}
        data-id={data.idCross}
        onClick={handleSelect}>
        X
      </button>
      <button
        className={classNames(styles.cell, figureSelect(data.idZero))}
        data-name={GameFigure.zero}
        data-id={data.idZero}
        onClick={handleSelect}>
        O
      </button>
    </>
  );
}

function figureSelect(currentId: string) {
  if (currentId) {
    return currentId === socket.id ? styles.selected : styles.disabled;
  }
  return styles.wait;
}

function handleSelect(e: React.MouseEvent<HTMLButtonElement>) {
  const figure: GameFigure = +((e.target as HTMLButtonElement).dataset.name || "0");
  const usedId = (e.target as HTMLButtonElement).dataset.id;
  if (usedId === socket.id) {
    sendMessage({ type: MessageType.drop, figure, id: socket.id });
  } else if (!usedId) {
    sendMessage({ type: MessageType.select, figure, id: socket.id });
  }
}

export default App;
