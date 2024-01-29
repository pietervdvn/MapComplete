import Constants from "../Models/Constants"

export default class Maproulette {
    public static readonly defaultEndpoint = "https://maproulette.org/api/v2"

    public static readonly STATUS_OPEN = 0
    public static readonly STATUS_FIXED = 1
    public static readonly STATUS_FALSE_POSITIVE = 2
    public static readonly STATUS_SKIPPED = 3
    public static readonly STATUS_DELETED = 4
    public static readonly STATUS_ALREADY_FIXED = 5
    public static readonly STATUS_TOO_HARD = 6
    public static readonly STATUS_DISABLED = 9

    public static readonly STATUS_MEANING = {
        0: "Open",
        1: "Fixed",
        2: "False_positive",
        3: "Skipped",
        4: "Deleted",
        5: "Already fixed",
        6: "Too_Hard",
        9: "Disabled",
    }
    public static singleton = new Maproulette()
    /*
     * The API endpoint to use
     */
    endpoint: string
    /**
     * The API key to use for all requests
     */
    private readonly apiKey: string

    /**
     * Creates a new Maproulette instance
     * @param endpoint The API endpoint to use
     */
    constructor(endpoint?: string) {
        this.endpoint = endpoint ?? Maproulette.defaultEndpoint
        if (!this.endpoint) {
            throw "MapRoulette endpoint is undefined. Make sure that `Maproulette.defaultEndpoint` is defined on top of the class"
        }
        this.apiKey = Constants.MaprouletteApiKey
    }

    /**
     * Converts a status text into the corresponding number
     *
     * Maproulette.codeToIndex("Created") // => 0
     * Maproulette.codeToIndex("qdsf") // => undefined
     *
     */
    public static codeToIndex(code: string): number | undefined {
        if (code === "Created") {
            return Maproulette.STATUS_OPEN
        }
        for (let i = 0; i < 9; i++) {
            if (Maproulette.STATUS_MEANING["" + i] === code) {
                return i
            }
        }
        return undefined
    }

    /**
     * Close a task; might throw an error
     *
     * Also see:https://maproulette.org/docs/swagger-ui/index.html?url=/assets/swagger.json&docExpansion=none#/Task/setTaskStatus
     * @param taskId The task to close
     * @param status A number indicating the status. Use MapRoulette.STATUS_*
     * @param options Additional settings to pass. Refer to the API-docs for more information
     */
    async closeTask(
        taskId: number,
        status = Maproulette.STATUS_FIXED,
        options?: {
            comment?: string
            tags?: string
            requestReview?: boolean
            completionResponses?: Record<string, string>
        }
    ): Promise<void> {
        console.log("Maproulette: setting", `${this.endpoint}/task/${taskId}/${status}`, options)
        const response = await fetch(`${this.endpoint}/task/${taskId}/${status}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                apiKey: this.apiKey,
            },
            body: options !== undefined ? JSON.stringify(options) : undefined,
        })
        if (response.status !== 204) {
            console.log(`Failed to close task: ${response.status}`)
            throw `Failed to close task: ${response.status}`
        }
    }
}
