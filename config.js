
const MINE_RATE  = 1000;
const INITIAL_DIFFICULTY = 4

const GENESIS_DATA = {
    timestamp: 1,
    lastHash: "---",
    hash: "genesis hash",
    data: [],
    difficulty: INITIAL_DIFFICULTY,
    nonce: 0,
}

const STARTING_BALANCE = 1000;


module.exports = { GENESIS_DATA, MINE_RATE, STARTING_BALANCE} 