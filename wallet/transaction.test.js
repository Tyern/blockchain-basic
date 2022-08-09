const Transaction = require("./transaction")
const Wallet = require("./index")

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
            expect(transaction.outputMap[recipient]).toEqual(amount)
        })

        it ("output the remaining balance to `sender wallet`", () => {
            expect(transaction.outputMap[senderWallet.publicKey]).toEqual(senderWallet.balance - amount)
        }) 
    })

   

})