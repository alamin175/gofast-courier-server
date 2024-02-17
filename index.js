const express = require("express");
require('dotenv').config();

const app = express();
const port = process.env.port || 5000;

const uri ="mongodb+srv://<user>:<password>@<cluster-url>?retryWrites=true&writeConcern=majority";

app.get("/", (req, res) => {
  res.send("GoFast courier data is coming");
});

app.get('/topRider', (req, res) => {
    const result = 
})

app.listen(port, () => {
  console.log("Port is listening ", port);
});
