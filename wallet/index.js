const { STARTING_BALANCE } = require("../config");
const { ec, cryptoHash} = require("../util")

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
}

module.exports = Wallet;