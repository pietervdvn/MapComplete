import { writeFileSync } from "fs"
import Script from "./Script"
import sunny from "../public/assets/sunny.json"

export class GenerateSunnyUnlabeled extends Script {
    constructor() {
        super("Generates 'sunny-unlabeled.json' based on sunny.json")
    }

    generateUnlabeled() {
        const unlabeled = { "#": "AUTOMATICALLY GENERATED! Do not edit.", ...sunny }
        unlabeled.name = unlabeled.name + "-unlabeled"
        unlabeled.layers = sunny.layers.filter(
            (l) => l.type !== "symbol" || !l.layout["text-field"]
        )
        writeFileSync("public/assets/sunny-unlabeled.json", JSON.stringify(unlabeled, null, "   "))
    }

    async main(args: string[]): Promise<void> {
        this.generateUnlabeled()
    }
}

new GenerateSunnyUnlabeled().run()
