const uuid = require("uuid");
const { verifySignature } = require("../util");

class Transaction {
    constructor({senderWallet, recipient, amount}) {
        this.id = uuid.v1();
        this.outputMap = this.createOutputMap({senderWallet, recipient, amount});
        this.input = this.createInput({
            senderWallet, 
            outputMap:this.outputMap
        })
    }

    createOutputMap({senderWallet, recipient, amount}) {
        const outputMap = {};
        outputMap[recipient] = amount;
        outputMap[senderWallet.publicKey] = senderWallet.balance - amount;
        
        return outputMap;
    }

    createInput({senderWallet, outputMap}) {
        return {
            timestamp: Date.now(),
            amount: senderWallet.balance,
            address: senderWallet.publicKey,
            signature: senderWallet.sign(outputMap) 
        }
    }

    static validTransaction(transaction) {
        const { input: {amount, address, signature}, outputMap } = transaction;

        const outputTotal = Object.values(outputMap).reduce((total, outputAmount) => (total + outputAmount))

        if (amount !== outputTotal) {
            return false;
        }

        if (! verifySignature({
            publicKey: address, 
            data: outputMap, 
            signature
        })) {
            return false;
        }
        return true;
    }
}

module.exports = Transaction