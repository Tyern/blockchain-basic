const redis = require("redis");

const CHANNELS = {
    TEST: "TEST",
    BLOCKCHAIN: "BLOCKCHAIN"
}

// Currently not working;;;
class PubSub {
    constructor({blockchain}) {

        // define blockchain to broadcast
        this.blockchain = blockchain
        
        // redis pubsub initialize
        this.publisher = redis.createClient({
            // legacyMode: true
        });

        this.subscriber = redis.createClient({
            // legacyMode: true
        });

        this.subscriber.connect();
        this.publisher.connect();

        this.subscribeToChannel();
    }

    handleMessage(channel, message) {
        console.log(`message received Channel ${channel}, Message ${message}`)
        const parsedMessage = JSON.parse(message);
        if (channel === CHANNELS.BLOCKCHAIN) {
            this.blockchain.replaceChain(parsedMessage);
        }
    }

    subscribeToChannel() {
        Object.values(CHANNELS).forEach(channel => {
            this.subscriber.subscribe(channel, (message, incoming_channel) => {
                this.handleMessage(incoming_channel, message);
            });
        })
    }

    publish({channel, message}) {
        // for not sending message to itself we implement unsubcribe before sending the message and subcribe it later
        this.subscriber.unsubscribe(channel).then(() => {
            this.publisher.publish(channel, message).then (() => {
                this.subscriber.subscribe(channel, (message, incoming_channel) => {
                    this.handleMessage(incoming_channel, message);
                });
            })
        })
    }

    broadcastChain() {
        this.publish({
            channel: CHANNELS.BLOCKCHAIN,
            message: JSON.stringify(this.blockchain.chain)
        })
    }
}

// **************************
// Alternative to Pubsub
// **************************
// const PubNub = require("pubnub");

// const credentials = {
//     publishKey: "pub-c-c6ffe043-e40d-4fff-99ad-e8edf998080c",
//     subscribeKey: "sub-c-d1e81ab8-24a1-462d-bf42-c898407c5c34",
//     secretKey: "sec-c-ZWE5OGRiYjYtNjJhMy00ZDJhLTkyYTEtOWZiYzU2YmY2NjI1",
//     uuid: "myuniqueuuid"
// }

// class PubSub {
//     constructor({ blockchain }) {
//         this.blockchain = blockchain;
//         this.pubnub = new PubNub(credentials);

//         this.subscribeToChannels();
//     }

//     listener() {
//         return {
//             message: this.handleMessage
//         }
//     }

//     publish({ channel, message }) {
//         this.pubnub.publish({
//             channel, message
//         })
//     }

//     handleMessage(messageObject) {
//         const {channel, message} = messageObject
//         console.log(`message received Channel ${channel}, Message ${message}`)

//         if (channel === CHANNELS.BLOCKCHAIN) {
//             const parsedMessage = JSON.parse(message)

//             this.blockchain.replaceChain(parsedMessage)
//         }
//     }

//     subscribeToChannels() {
//         this.pubnub.subscribe({
//             channels: Object.values(CHANNELS)
//         })
//         this.pubnub.addListener(this.listener())
//     }

//     broadcastChain() {
//         this.publish({ 
//             channel: CHANNELS.BLOCKCHAIN, 
//             message: JSON.stringify(this.blockchain.chain)
//         })
//     }
// }

// const testPubSub = new PubSub( {blockchain: undefined} );

// testPubSub.publish({
//     channel: CHANNELS.TEST, 
//     message: '["foo"]'
// })
// testPubSub.publish({
//     channel: CHANNELS.TEST, 
//     message: '["foo1"]'
// })

module.exports = PubSub;
