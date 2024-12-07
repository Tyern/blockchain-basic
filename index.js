const express = require("express");
const { redirect } = require("express/lib/response");
const Blockchain = require("./blockchain/index");
const bodyParser = require("body-parser");
const PubSub = require("./app/pubsub");
const request = require("request");
const TransactionPool = require('./wallet/transaction-pool');
const Wallet = require('./wallet');
const TransactionMiner = require('./app/transaction-miner');

const app = express();

app.use(bodyParser.json());

const blockchain = new Blockchain();
const transactionPool = new TransactionPool();
const pubsub = new PubSub({ blockchain, transactionPool });
const transactionMiner = new TransactionMiner({ blockchain, transactionPool, wallet, pubsub });

const wallet = new Wallet();

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

app.post('/api/transact', (req, res) => {

    const { amount, recipient } = req.body;
    let transaction = transactionPool.existingTransaction({ inputAddress: wallet.publicKey });

    try {
        if (transaction) {
            transaction.update({ senderWallet: wallet, recipient, amount });
        } else {
            transaction = wallet.createTransaction({
                recipient,
                amount,
                chain: blockchain.chain
            });
        }

    } catch(error) {
        return res.status(400).json({ type: 'error', message: error.message });
    }

    transactionPool.setTransaction(transaction);

    pubsub.broadcastTransaction(transaction);
    console.log('transactionPool', transactionPool);

    res.json({ type: 'success', transaction });
});

app.get('/api/transaction-pool-map', (req, res) => {
    res.json(transactionPool.transactionMap);
});

app.get('/api/mine-transactions', (req, res) => {
    transactionMiner.mineTransactions();
    res.redirect('/api/blocks');
});

app.get('/api/wallet-info', (req, res) => {
    const address = wallet.publicKey;
    res.json({
        address,
        balance: Wallet.calculateBalance({ chain: blockchain.chain, address })
    });
});
  

const syncWithRootState = () => {
    request({ "url": `${ROOT_NODE_ADDRESS}/api/blocks`}, 
        (error, response, body) => {
            if (!error && response.statusCode === 200) {
                const rootChain = JSON.parse(body);
                
                console.log(`replace chain on a sync with ${rootChain}`);
                blockchain.replaceChain(rootChain)
            }
        }
    )

    request({ url: `${ROOT_NODE_ADDRESS}/api/transaction-pool-map` }, (error, response, body) => {
        if (!error && response.statusCode === 200) {
            const rootTransactionPoolMap = JSON.parse(body);
            console.log('replace transaction pool map on a sync with', rootTransactionPoolMap);
            transactionPool.setMap(rootTransactionPoolMap);
        }
    });
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
        syncWithRootState();
    }
})
