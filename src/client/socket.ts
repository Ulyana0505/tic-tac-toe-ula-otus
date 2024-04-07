import { nanoid } from "nanoid";
import { GameBoard, MessageData } from "../types";
import { MessageType } from "../common";

export const socket = {
  current: null as unknown as WebSocket,
  id: nanoid(),
  onMessage: null as null | ((_data: GameBoard) => void)
};

const pref = location.protocol.endsWith("s:") ? "wss:" : "ws:";
const path = pref + "//" + location.host + "/ws/" + socket.id;

socket.current = init();

function init() {
  const current = new WebSocket(path);

  current.onopen = function () {
    sendMessage({ type: MessageType.connect });
  };

  current.onclose = function (event) {
    if (event.wasClean) {
      console.log("Соединение закрыто чисто");
    } else {
      // 1006
      console.log("Обрыв соединения");
      socket.current = init();
    }
    console.log("Код: " + event.code + " причина: " + event.reason);
  };

  current.onmessage = function (event) {
    let data: GameBoard | null = null;
    try {
      data = JSON.parse(event.data);
    } catch (e) {
      console.error(e);
    }
    if (data && socket.onMessage) {
      socket.onMessage(data);
    }
  };

  current.onerror = function (error: Event) {
    console.log("Ошибка ", error);
  };

  return current;
}

export function sendMessage(data: MessageData) {
  socket.current.send(JSON.stringify(data));
}
