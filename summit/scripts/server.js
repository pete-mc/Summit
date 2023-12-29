/* eslint-disable @typescript-eslint/no-var-requires */
// server.js
const express = require("express");
const path = require("path");
const app = express();
const port = 3000;
const cors = require("cors");

app.use(cors());
app.use(
  express.static(path.join(__dirname, "../bin"), {
    etag: false,
    maxAge: "0",
    setHeaders: function (res) {
      res.setHeader("Cache-Control", "no-cache");
    },
  }),
);

app.listen(port, () => {
  console.log(`Development server running at http://localhost:${port}/`);
});
