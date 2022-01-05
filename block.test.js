const Block = require("./block")
const { GENESIS_DATA } = require("./config");
const cryptoHash = require("./crypto-hash");

describe("Block", () => {
    const timestamp = "a-date";
    const lastHash = "foo-last-hash";
    const hash = "bar-hash";
    const data = ["blockchain", "data"];
    const block = new Block({
        timestamp, lastHash, hash, data
    })

    it("has a timestamp, lashHash , hash. and data property", () => {
        expect(block.timestamp).toEqual(timestamp)
        expect(block.lastHash).toEqual(lastHash)
        expect(block.hash).toEqual(hash)
        expect(block.data).toEqual(data)
    })

    describe("genesis()", () => {
        const genesisBlock = Block.genesis()

        it("return a Block instance", () => {
            expect(genesisBlock instanceof Block).toBe(true)
        })

        it("return the genesis data", () => {
            expect(genesisBlock).toEqual(GENESIS_DATA)
        })
    })

    describe("mineBlock()", () => {
        const lastBlock = Block.genesis()
        const data = "mined data"
        const mineBlock = Block.mineBlock({
            lastBlock, data
        })

        it("return a Block instance", () => {
            expect(mineBlock instanceof Block).toBe(true)
        })

        it("set the lastHash to be the hash of the lastBlock", () => {
            expect(mineBlock.lastHash).toEqual(lastBlock.hash)
        })

        it("set the data", () => {
            expect(mineBlock.data).toEqual(data)
        })

        it ("set a timestamp", () => {
            expect(mineBlock.timestamp).not.toEqual(undefined)
        }) 

        it ("create SHA-256 hash based on proper input", ()=> {
            expect(mineBlock.hash).toEqual(cryptoHash(mineBlock.timestamp, lastBlock.hash, data))
        })
    })
})
