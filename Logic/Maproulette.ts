import Constants from "../Models/Constants"

export default class Maproulette {
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
        2: "False positive",
        3: "Skipped",
        4: "Deleted",
        5: "Already fixed",
        6: "Too hard",
        9: "Disabled",
    }

    /*
     * The API endpoint to use
     */
    endpoint: string

    /**
     * The API key to use for all requests
     */
    private readonly apiKey: string

    public static singleton = new Maproulette()
    /**
     * Creates a new Maproulette instance
     * @param endpoint The API endpoint to use
     */
    constructor(endpoint: string = "https://maproulette.org/api/v2") {
        this.endpoint = endpoint
        this.apiKey = Constants.MaprouletteApiKey
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
