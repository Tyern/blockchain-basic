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

    describe("update()", () => {
        let originalSignature, originalSenderOutput, nextRecipient, nextAmount;

        beforeEach(() => {
            originalSignature = transaction.input.signature;
            originalSenderOutput = transaction.outputMap[senderWallet.publicKey]
            nextRecipient = "next-foo"
            nextAmount = 50

            transaction.update({
                senderWallet, recipient: nextRecipient, amount: nextAmount
            })
        })

        it ("output the amount to the next recipient", () => {
            expect(transaction.outputMap[nextRecipient]).toEqual(nextAmount)
        })
    
        it ("subtract the amount from the original sender output amount", () => {
            expect(transaction.outputMap[senderWallet.publicKey])
                .toEqual(originalSenderOutput - nextAmount)
        })

        it ("maintain a total output that matches the input amount", () => {
            expect(
                Object.values(transaction.outputMap).reduce(
                    (total, outputAmount) => {return total + outputAmount}
                )
            ).toEqual(transaction.input.amount)
        })

        it ("re-signs the transaction", () => {
            expect(transaction.input.signature).not.toEqual(originalSignature)
        })
    })

})