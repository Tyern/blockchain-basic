const Wallet = require("./index")
const { verifySignature } = require("../util")
const Transaction = require("./transaction")

describe('Wallet', () => {
    let wallet;

    beforeEach(() => {
        wallet = new Wallet();
    })

    it ("has a balance", () => {
        expect(wallet).toHaveProperty("balance");
    }) 

    it ("has a publicKey", () => {
        expect(wallet).toHaveProperty("publicKey");
    })

    describe ("signing data", () => {
        const data = "football";

        it ("verify a signature", () => {
            expect(
                verifySignature({
                    publicKey: wallet.publicKey,
                    data,
                    signature: wallet.sign(data)
                })
            ).toBe(true);
        }) 

        it ("does not verify a invalid signature", () => {
            expect(
                verifySignature({
                    publicKey: wallet.publicKey,
                    data,
                    signature: new Wallet().sign(data)
                })
            ).toBe(false);
        }) 
    })

    describe("create Transaction()", () => {
        describe("and the amound exceed the balance", () => {
            it("throws an error", () => {
                expect( () => wallet.createTransaction({
                    amount: 999999, 
                    recipient: "foo"
                })).toThrow("Amount exceeds balance")
            })
        })

        describe("and the amount is invalid", () => {
            let transaction, amount, recipient;

            beforeEach( () => {
                amount = 50;
                recipient = "foo-recipient";
                transaction = wallet.createTransaction({
                    amount,
                    recipient
                })
            })
            
            it("create an instance of Transaction", () => {
                expect(transaction instanceof Transaction).toBe(true)
            })

            it("matches the transaction input with the Wallet", () => {
                expect(transaction.input.address).toEqual(wallet.publicKey)
            })

            it("output the amount the recipient", () => {
                expect(transaction.outputMap[recipient]).toEqual(amount)
            })

        })
    })
})