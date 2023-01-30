const { GENESIS_DATA, MINE_RATE }  = require("../config")
const {cryptoHash} = require("../util")  
const hexToBinary = require("hex-to-binary")

// The block class 
class Block {
    constructor({timestamp, lastHash, hash, data, nonce, difficulty}) {
        this.timestamp = timestamp
        this.data = data
        this.hash = hash
        this.lastHash = lastHash
        this.nonce = nonce
        this.difficulty = difficulty
    }

    static genesis() { // return the genesis block
        return new this(GENESIS_DATA)
    }

    static mineBlock({lastBlock, data}) { // return the new block to be added to the chain
        let nonce = 0
        let hash = ""
        let timestamp = Date.now()
        let now = Date.now()
        let difficulty = Block.adjustDifficulty({originalBlock: lastBlock, 
            timestamp})
        while (hexToBinary(hash).substring(0, difficulty) !== "0".repeat(difficulty)){
            timestamp = Date.now()
            nonce += 1
            difficulty = Block.adjustDifficulty({originalBlock: lastBlock, 
                timestamp})
            hash = cryptoHash(
                timestamp, 
                lastBlock.hash,
                data,
                difficulty,
                nonce
            )
        }
        return new Block(
            {
                timestamp: timestamp,
                lastHash: lastBlock.hash,
                hash: hash,
                data: data,
                nonce: nonce,
                difficulty: Block.adjustDifficulty({originalBlock:lastBlock, 
                                                    timestamp}),
            }
        )
    }

    static adjustDifficulty({originalBlock, timestamp}) {
        const {difficulty} = originalBlock;

        if (difficulty < 1) return 1;

        if (timestamp - originalBlock.timestamp < MINE_RATE) {
            return difficulty + 1
        } else {
            return difficulty - 1
        }
    }
}

module.exports = Block; // mean of sharing data between javascript file
