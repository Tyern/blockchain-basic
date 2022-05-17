const express = require("express");
const { redirect } = require("express/lib/response");
const Blockchain = require("./blockchain");
const bodyParser = require("body-parser");
const PubSub = require("./pubsub")

const app = express();

app.use(bodyParser.json());

const blockchain = new Blockchain();
const pubsub = new PubSub({ blockchain: blockchain})

setTimeout(() => pubsub.broadcastChain(), 1000)

app.get("/api/blocks", (req, res) => {
    res.json(blockchain.chain);
})

app.post("/api/mine", (req, res) => {
    const {data} = req.body;

    blockchain.addBlock({ data });

    pubsub.broadcastChain()

    res.redirect("/api/blocks");
})

const DEFAULT_PORT = 3000;
let PEER_PORT

// run with npm run dev-peer
if (process.env.GENERATE_PEER_PORT === 'true') {
    PEER_PORT = DEFAULT_PORT + Math.ceil(Math.random() * 1000);
}

const PORT = PEER_PORT || DEFAULT_PORT;
app.listen(PORT, () => console.log(`Running app on Port = ${PORT}`))