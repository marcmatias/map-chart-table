import dotenv from "dotenv";
import fs from "fs";
import path from "path";

dotenv.config();

import express from "express";

// Initialize App
const app = express();
const __dirname = path.resolve();

// Define an API endpoint that supports pagination
app.get('/sick/:sick', (req, res) => {
  res.header("Content-Type",'application/json');
  res.sendFile(path.join(__dirname, `./api/${req.params.sick}.json`));
});

app.get('/sicks/:sick', (req, res) => {
  res.header("Content-Type",'application/json');
  const sicks = req.params.sick.split(",");
  const result = {};
  for (const sick of sicks) {
    result[sick] = JSON.parse(fs.readFileSync(path.join(__dirname, `./api/${sick}.json`)));
  }
  res.send(result);
});

// Start server on PORT 5000
const port = process.env.SERVER_HOST_PORT;
app.listen(port, () => {
  console.log(`\nServer started at ${port}!\n`);
});
