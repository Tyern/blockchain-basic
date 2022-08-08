const express = require("express");
const { redirect } = require("express/lib/response");
const Blockchain = require("./blockchain");
const bodyParser = require("body-parser");
const PubSub = require("./pubsub");
const request = require("request");

const app = express();

app.use(bodyParser.json());

const blockchain = new Blockchain();
const pubsub = new PubSub({ blockchain: blockchain})

const DEFAULT_PORT = 3000;
const ROOT_NODE_ADDRESS =  `http://localhost:${DEFAULT_PORT}`;

app.get("/api/blocks", (req, res) => {
    res.json(blockchain.chain);
})

app.post("/api/mine", (req, res) => {
    const {data} = req.body;

    console.info(`mine with data: ${data}`);
    blockchain.addBlock({ data });

    pubsub.broadcastChain()

    res.redirect("/api/blocks");
})

const syncChains = () => {
    request({ "url": `${ROOT_NODE_ADDRESS}/api/blocks`}, 
        (error, response, body) => {
            if (!error && response.statusCode === 200) {
                const rootChain = JSON.parse(body);
                
                console.log(`replace chain on a sync with ${rootChain}`);
                blockchain.replaceChain(rootChain)
            }
        }
    )
}

// run with different random port when default port has been used
let PEER_PORT

// run with npm run dev-peer
if (process.env.GENERATE_PEER_PORT === 'true') {
    PEER_PORT = DEFAULT_PORT + Math.ceil(Math.random() * 1000);
}

const PORT = PEER_PORT || DEFAULT_PORT;
app.listen(PORT, () => {
    console.log(`Running app on Port = ${PORT}`)
    if (PORT !== DEFAULT_PORT) {
        syncChains()
    }
})
