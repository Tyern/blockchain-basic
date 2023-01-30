const Transaction = require("./transaction")
const Wallet = require("./index");
const { verifySignature } = require("../util");

describe("Transaction", () => {
    let transaction, senderWallet, recipient, amount;

    beforeEach( () => {
        senderWallet = new Wallet();
        recipient = "recipient-wallet-public-key";
        amount = 50;

        transaction = new Transaction({senderWallet, recipient, amount})
    })

    it ("has an `id`", () => {
        expect(transaction).toHaveProperty("id");
    })

    describe("outputMap", () => {
        it ("has an `outputMap`", () => {
            expect(transaction).toHaveProperty("outputMap");
        })

        it ("output the amount to the recipient", () => {
            expect(transaction.outputMap[recipient]).toEqual(amount);
        })

        it ("output the remaining balance to `sender wallet`", () => {
            expect(transaction.outputMap[senderWallet.publicKey]).toEqual(senderWallet.balance - amount);
        }) 
    })

    describe("input", () => {
        it ("has an `input` (timestamp property)", () => {
            expect(transaction).toHaveProperty("input");
        })

        it ("has an `timestamp` in input", () => {
            expect(transaction.input).toHaveProperty("timestamp");
        })

        // transaction input must contain the following property:
        // - amount: sender wallet balance
        // - address: sender wallet public key
        // - signature: to verify the transaction

        it ('set the `amount` to the sender wallet `balance`', () => {
            expect(transaction.input.amount).toEqual(senderWallet.balance);
        })

        it ('set the `address` to the sender public key', () => {
            expect(transaction.input.address).toEqual(senderWallet.publicKey);
        })

        it ('sign the input', () => {
            expect(
                verifySignature({
                    publicKey: senderWallet.publicKey, 
                    data: transaction.outputMap,
                    signature: transaction.input.signature
                })
            ).toBe(true)
        })
    })

    describe("valid transaction", () => {

        let errorMock;

        beforeEach(() => {
            transaction = transaction;

            errorMock = jest.fn();

            global.console.error = errorMock;
        })

        describe("transaction is valid", () => {
            
            it ("has an `outputMap`", () => {
                expect(transaction).toHaveProperty("outputMap");
            })

            it ("return true", () => {
                expect (Transaction.validTransaction(transaction)).toBe(true)
            })
        })

        describe("transaction is invalid", () => {

            it ("has an `outputMap`", () => {
                expect(transaction).toHaveProperty("outputMap");
            })

            describe("transaction outputMap is invalid", () => {
                it ("return false and log the error", () => {
                    transaction.outputMap[senderWallet.publicKey] = 99999;

                    expect (Transaction.validTransaction(transaction)).toBe(false);
                    // expect (errorMock).toHaveBeenCalled();
                })
            })

            describe("transaction signature is invalid", () => {
                it ("return false and log the error", () => {
                    transaction.input.signature = new Wallet().sign("data");

                    expect (Transaction.validTransaction(transaction)).toBe(false);
                    // expect (errorMock).toHaveBeenCalled();
                })
            })
        })
    })

})