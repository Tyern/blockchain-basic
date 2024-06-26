const cryptoHash = require("./crypto-hash")

describe("cryptoHash()", () => {
    it ("generate a SHA-256 hashed output", () => {
        expect(cryptoHash("foo")).toEqual(
            "b2213295d564916f89a6a42455567c87c3f480fcd7a1c15e220f17d7169a790b"
        )
    })

    it ("generate with the same hash with any sorting order", () => {
        expect(cryptoHash("one", "two", "three")).toEqual(cryptoHash("three", "two", "one"))
    })

    it ("produce a unique hash when the properties have changed", () => {
        const foo = {}
        const originalHash = cryptoHash(foo)

        foo.foo = 5
        expect(cryptoHash(foo)).not.toEqual(originalHash)

    })
})