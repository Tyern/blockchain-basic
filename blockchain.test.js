const Blockchain = require("./blockchain") 
const Block = require("./block");

describe("Blockchain()", ()=> {
    let blockchain, newChain

    beforeEach(()=> {
        blockchain = new Blockchain()
        newChain = new Blockchain()
    })

    it("contain a chain array instance", () => {
        expect(blockchain.chain instanceof Array).toBe(true)
    })

    it("start with a genesis block", ()=> {
        expect(blockchain.chain[0]).toEqual(Block.genesis())
    })

    it("add new block to the chain", () => {
        const newData = "foo bar"
        blockchain.addBlock({
            data: newData
        })
        expect(blockchain.chain[blockchain.chain.length - 1].data).toEqual(newData)
    })

    describe("isValidChain()", ()=> {
        describe("when the chain does not start with the genesis block", ()=> {
            it("return false", ()=> {
                blockchain.chain[0] = { data: "fake-genesis"}
                expect(Blockchain.isValidChain(blockchain.chain)).toBe(false)
            })
        })

        describe("when the chain start with genesis block and follow by multiple block", ()=> {
            
            beforeEach(()=> {
                blockchain.addBlock({data: "Bear"})
                blockchain.addBlock({data: "Beets"})
                blockchain.addBlock({data: "Battle Acamedia"})
            })

            describe("and a lastHash reference has change", ()=> {
                it("return false", ()=> {
                    blockchain.chain[2].lastHash = "broken hash"

                    expect(Blockchain.isValidChain(blockchain.chain)).toBe(false)
                })
            })

            describe("and the chain contains a block with an invalid field", ()=> {
                it("return false", ()=> {
                    blockchain.chain[2].data = "bad data"

                    expect(Blockchain.isValidChain(blockchain.chain)).toBe(false)
                })
            })

            describe("and the chain does not contain any invalid blocks", ()=> {
                it("return true", ()=> {
                    expect(Blockchain.isValidChain(blockchain.chain)).toBe(true)
                })
            })
        })
    })
    describe("replaceChain()", ()=> {
        let errorMock, logMock
        let originalChain
        beforeEach(()=> {
            originalChain = blockchain.chain

            errorMock = jest.fn()
            logMock = jest.fn()

            global.console.error = errorMock
            global.console.log = logMock
        })

        describe("when the new chain is not longer", ()=> {
            it("does not replace the chain", ()=> {
                newChain.chain[0] = { new: "chain"}
                blockchain.replaceChain(newChain.chain)

                expect(blockchain.chain).toEqual(originalChain)
            })
        })

        describe("when the new chain is longer", ()=> {
            beforeEach(()=> {
                newChain.addBlock({data: "Bear"})
                newChain.addBlock({data: "Beets"})
                newChain.addBlock({data: "Battle Acamedia"})
            })

            describe("and the chain is not valid", ()=> {
                it("does not replace the chain", ()=> {
                    newChain.chain[2].lastHash = "broken hash"
                    blockchain.replaceChain(newChain.chain)

                    expect(blockchain.chain).toEqual(originalChain)
                })
            })
            describe("and the chain is valid", ()=> {
                beforeEach(()=> {
                    blockchain.replaceChain(newChain.chain)
                })

                it("replace the chain", ()=> {
                    expect(blockchain.chain).toEqual(newChain.chain)
                    expect(Blockchain.isValidChain(blockchain.chain)).toBe(true)
                })

                it("log about the chain replacement", ()=> {
                    expect(logMock).toHaveBeenCalled()
                })
            })
        })
    })

})