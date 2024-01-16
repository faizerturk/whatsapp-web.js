const express = require("express");
const { Client, LocalAuth, RemoteAuth } = require("whatsapp-web.js");
const { Server } = require("socket.io");
const app = express();
const http = require("http");
const server = http.createServer(app);
const port = 3001;
const OpenAI = require("openai");
const { MongoStore } = require("wwebjs-mongo");
const mongoose = require("mongoose");
require("dotenv").config();

let store;
mongoose.connect(process.env.MONGO_KEY).then(() => {
  console.log("Connect mongoDB");
  store = new MongoStore({ mongoose: mongoose });
  console.log("store", store);
});

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

app.get("/", (req, res) => {
  res.send("<h1>Hello from client</h1>");
});

server.listen(port, () => {
  console.log("listening on port *:3001");
});

const allSessionsObject = {};
const createWhatsappSession = (id, socket) => {
  const client = new Client({
    puppeteer: {
      headless: false,
    },
    authStrategy: new RemoteAuth({
      clientId: id,
      store: store,
      backupSyncIntervalMs: 300000,
    }),
  });

  client.on("qr", (qr) => {
    console.log("QR received", qr);
    socket.emit("qr", { qr });
  });

  client.on("authenticated", () => {
    console.log("Authenticated");
  });

  client.on("ready", () => {
    console.log("client is ready");
    allSessionsObject[id] = client;
    socket.emit("ready", { id, message: "Client is ready!" });
  });

  client.on("remote_session_saved", () => {
    console.log("Remote session saved");
    socket.emit("remote_session_saved", {
      message: "Remote session saved",
    });
  });

  const openai = new OpenAI({
    apiKey: process.env.API_KEY,
  });

  const chatHistory = {};

  function updateChatHistory(userId, message, isUser) {
    if (!chatHistory[userId]) {
      chatHistory[userId] = [];
    }
    chatHistory[userId].push({
      role: isUser ? "user" : "assistant",
      content: message,
    });
  }

  async function runCompletion(userId, message) {
    try {
      const messages = chatHistory[userId] ? [...chatHistory[userId]] : [];
      messages.push({
        role: "assistant",
        content:
          "you're my personal assistant (My name is faize and with this information you can return to people who contact me as 'I am faize's assistant'.). it's your duty to reply to my messages in a polite and courteous manner as a my assitant . ",
      });
      const response = await openai.chat.completions.create({
        model: "gpt-4",
        messages: messages,
        max_tokens: 1000,
      });
      updateChatHistory(userId, response.choices[0].message.content, false);

      return response.choices[0].message.content;
    } catch (error) {
      if (error instanceof OpenAI.APIError) {
        console.error("Error with OpenAI API:", error.message);
      } else {
        console.error("Unexpected error:", error);
      }
    }
  }

  client.on("message", (message) => {
    const userId = message.from;
    updateChatHistory(userId, message.body, true);

    runCompletion(userId, message.body).then((result) => {
      message.reply(result);
    });
  });

  client.initialize();
};

const getWhatsappSession = (id, socket) => {
  const client = new Client({
    puppeteer: {
      headless: false,
    },
    authStrategy: new RemoteAuth({
      clientId: id,
      store: store,
      backupSyncIntervalMs: 300000,
    }),
  });

  client.on("ready", () => {
    console.log("client is ready");
    socket.emit("ready", { id, message: "client is ready" });
  });

  client.on("qr", (qr) => {
    socket.emit("qr", {
      id,
      message: "user got logged out and here is another QR code",
    });
  });

  client.initialize();
};

io.on("connection", (socket) => {
  console.log("a user connected", socket?.id);
  socket.on("disconnect", () => {
    console.log("user disconnected");
  });

  socket.on("connected", (data) => {
    console.log("connected to the server");
    socket.emit("hello", "hello from server");
  });

  socket.on("createSession", (data) => {
    console.log("created session", data);
    const { id } = data;
    createWhatsappSession(id, socket);
  });

  socket.on("getSession", (data) => {
    console.log("getSession", data);
    const { id } = data;
    getWhatsappSession(id, socket);
  });

  socket.on("getAllChats", async (data) => {
    console.log("getAllChats", data);
    const { id } = data;
    const client = allSessionsObject[id];
    const allChats = await client.getChats();
    socket.emit("AllChats", { allChats });
  });
});
