const express = require("express");
const { Client, LocalAuth } = require("whatsapp-web.js");
const app = express();
const port = 3001;

const client = new Client({
  puppeteer: {
    headless: false,
  },
  authStrategy: new LocalAuth({
    clientId: "CLIENT_ID",
  }),
});

client.on("qr", (qr) => {
  console.log("QR received", qr);
});

client.on("ready", () => {
  console.log("client is ready");
});

client.initialize();

app.listen(port, () => {
  console.log(`server listening on port::${port}`);
});
