const fs = require("fs");
const path = require("path");
const express = require("express");
const dotenv = require("dotenv");

dotenv.config();

const app = express();
const port = 3000;

app.use(express.static("public"));

app.get("/randomWord", (req, res) => {
  const filePath = path.join(__dirname, "words.csv");
  fs.readFile(filePath, "utf8", (err, data) => {
    if (err) {
      console.error("Error reading file:", err);
      res.status(500).json({ error: "Internal Server Error" });
      return;
    }
    const lines = data.split("\n");
    const randomIndex = Math.floor(Math.random() * lines.length);
    const [word, value] = lines[randomIndex].split(",");
    res.json({ word, value });
  });
});

app.get("/pexelsApiKey", (req, res) => {
  res.json({ apiKey: process.env.PEXELS_API_KEY });
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
