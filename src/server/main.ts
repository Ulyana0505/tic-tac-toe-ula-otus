import express from "express";
import express_ws from "express-ws";
import ViteExpress from "vite-express";
import { GameStatus, MessageType } from "../common.js";
import { MessageData } from "../types.js";
import "./store.js";
import { boardInit, figureDrop, figureSelect, store, userDisconnected, userTurn } from "./store.js";

const app = express();
app.get("/test", (_, res) => {
  res.send("Hello!");
});

const app_ws = express_ws(app);
app_ws.app.ws("/ws/:userId", function (ws, req) {
  ws.on("message", handleMessage);
  ws.on("close", function (_reasonCode, _description) {
    if (store.getState().status === GameStatus.finished) {
      store.dispatch(boardInit());
    } else {
      store.dispatch(userDisconnected(req.params.userId));
    }
  });
});

ViteExpress.listen(app, 3000, () => console.log("Server is listening on port 3000..."));

// ===

function handleMessage(msg: string) {
  let data: MessageData | null = null;
  try {
    data = JSON.parse(msg);
  } catch (e) {
    console.error(e);
  }
  if (!data) return;
  switch (data.type) {
    case MessageType.connect: {
      handleStore();
      break;
    }
    case MessageType.select: {
      store.dispatch(figureSelect(data));
      break;
    }
    case MessageType.drop: {
      store.dispatch(figureDrop(data));
      break;
    }
    case MessageType.turn: {
      store.dispatch(userTurn(data));
      break;
    }
    case MessageType.init: {
      store.dispatch(boardInit());
      break;
    }
  }
}

store.subscribe(handleStore);

function handleStore() {
  const state = store.getState();
  app_ws.getWss().clients.forEach((wss) => {
    if (wss.readyState === wss.OPEN) {
      wss.send(JSON.stringify(state));
    }
  });
}
