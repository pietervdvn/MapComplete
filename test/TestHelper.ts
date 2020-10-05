export default class T {

    constructor(tests: [string, () => void ][]) {
        let failures : string []= [];
        for (const [name, test] of tests) {
            try {
                test();
            } catch (e) {
                failures.push(name);
                console.warn("Failed test: ", name, "because", e);
            }
        }
        if (failures.length == 0) {
            console.log("All tests done!")
        } else {
            console.warn(failures.length, "tests failed :(")
            console.log("Failed tests: ", failures.join(","))
        }
    }

}
