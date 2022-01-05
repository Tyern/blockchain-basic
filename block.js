const { GENESIS_DATA }  = require("./config")
const cryptoHash = require("./crypto-hash")  

// The block class 
class Block {
    constructor({timestamp, lastHash, hash, data}) {
        this.timestamp = timestamp
        this.data = data
        this.hash = hash
        this.lastHash = lastHash
    }

    static genesis() { // return the genesis block
        return new this(GENESIS_DATA)
    }

    static mineBlock({lastBlock, data}) { // return the new block to be added to the chain
        const timestamp = Date.now()
        return new this(
            {
                timestamp,
                lastHash: lastBlock.hash,
                data: data,
                hash: cryptoHash(timestamp, lastBlock.hash, data)
            }
        )
    }
}

module.exports = Block; // mean of sharing data between javascript file
