const express = require("express");
const { redirect } = require("express/lib/response");
const Blockchain = require("./blockchain");
const bodyParser = require("body-parser");

const app = express();

app.use(bodyParser.json());

const blockchain = new Blockchain();

app.get("/api/blocks", (req, res) => {
    res.json(blockchain.chain);
})

app.post("/api/mine", (req, res) => {
    const {data} = req.body;

    blockchain.addBlock({ data });

    res.redirect("/api/blocks");
})

let PORT = 3000;
app.listen(PORT, () => console.log(`Running app on Port = ${PORT}`))