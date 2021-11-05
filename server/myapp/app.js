const express = require("express");
const app = express();
const port = 5000;

const cors = require("cors");

app.use(
  cors({
    origin: "*",
  })
);

app.get("/file", (req, res) => {
  res.send([{ id: "15", filename: "CSGO", filesize: 500 }]);
});

app.post("/file", (req, res) => {
  console.log('receiving data ...');
    console.log('body is ',req.body);
    res.send(req.body);
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
