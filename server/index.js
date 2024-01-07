const express = require("express");
const { Client } = require("whatsapp-web.js");
const app = express();
const port = 3001;

app.listen(port, () => {
  console.log("server listening on port::${port}");
});

const client = new Client();
