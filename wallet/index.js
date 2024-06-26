const { STARTING_BALANCE } = require("../config");
const { ec, cryptoHash} = require("../util")
const Transaction = require("./transaction")

class Wallet {
    constructor() {
        this.balance = STARTING_BALANCE;

        // create public and private key pair
        this.keyPair = ec.genKeyPair();

        this.publicKey = this.keyPair.getPublic().encode("hex");
    }

    sign(data) {
        return this.keyPair.sign(cryptoHash(data))
    }

    createTransaction({
        amount, recipient
    }) {
        if (amount > this.balance) {
            throw new Error("Amount exceeds balance")
        }

        return new Transaction({
            senderWallet: this,
            recipient,
            amount
        })
    }
}

module.exports = Wallet;