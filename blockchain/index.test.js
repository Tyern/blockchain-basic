const Blockchain = require("./index") 
const Block = require("./block");
const {cryptoHash} = require("../util")
const Wallet = require('../wallet');
const Transaction = require('../wallet/transaction');

describe("Blockchain()", ()=> {
    let blockchain, newChain, originalChain, errorMock;

    beforeEach(()=> {
        blockchain = new Blockchain()
        newChain = new Blockchain()
        errorMock = jest.fn();

        global.console.error = errorMock;
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

            describe("and the chain contains a block with a jumped difficulty" , () => {
                it("return false", ()=> {
                    const lastBlock = blockchain.chain[blockchain.chain.length - 1]
                    const lastHash = lastBlock.lastHash
                    const timestamp = Date.now()
                    const nonce = 0
                    const data = []
                    const difficulty = lastBlock.difficulty - 3

                    const hash = cryptoHash(difficulty, timestamp, lastHash, nonce, data)

                    const badBlock = new Block({
                        timestamp, lastHash, hash, nonce, difficulty, data
                    })

                    blockchain.chain.push(badBlock)

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
        let logMock
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

    describe('validTransactionData()', () => {
        let transaction, rewardTransaction, wallet;
        beforeEach(() => {
            wallet = new Wallet();
            transaction = wallet.createTransaction({ recipient: 'foo-address', amount: 65 });
            rewardTransaction = Transaction.rewardTransaction({ minerWallet: wallet });
        });

        describe('and the transaction data is valid', () => {
            it('returns true', () => {
                newChain.addBlock({ data: [transaction, rewardTransaction] });
                expect(blockchain.validTransactionData({ chain: newChain.chain })).toBe(true);
                expect(errorMock).not.toHaveBeenCalled();
            });
        });

        describe('and the transaction data has multiple rewards', () => {
            it('returns false and logs an error', () => {
                newChain.addBlock({ data: [transaction, rewardTransaction, rewardTransaction] });
                expect(blockchain.validTransactionData({ chain: newChain.chain })).toBe(false);
                expect(errorMock).toHaveBeenCalled();
            });
        });

        describe('and the transaction data has at least one malformed outputMap', () => {
            describe('and the transaction is not a reward transaction', () => {
                it('returns false and logs an error', () => {
                    transaction.outputMap[wallet.publicKey] = 999999;
                    newChain.addBlock({ data: [transaction, rewardTransaction ]});
                    expect(blockchain.validTransactionData({ chain: newChain.chain })).toBe(false);
                    expect(errorMock).toHaveBeenCalled();
                });
            });
        })
            
        describe('and the transaction is a reward transaciton', () => {
            it('returns false and logs an error', () => {
                rewardTransaction.outputMap[wallet.publicKey] = 999999;
                newChain.addBlock({ data: [transaction, rewardTransaction] });
                expect(blockchain.validTransactionData({ chain: newChain.chain })).toBe(false);
                expect(errorMock).toHaveBeenCalled();
            });
        });

        describe('and the transaction data has at least one malformed input', () => {
            it('returns false and logs an error', () => {});
        });

        describe('and a block contains multiple identical transactions', () => {
            it('returns false and logs an error', () => {});
        });
    });
})