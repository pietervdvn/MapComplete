import { Utils } from "./Utils"

class Test {
    public async test() {
        await Utils.waitFor(0)
        const response = await fetch("http://localhost:1235/layers/atm/atm.json", {
            method: "POST",
            headers: {
                "Content-Type": "application/json;charset=utf-8",
            },
            body: JSON.stringify({}),
        })
    }
}

new Test().test()
