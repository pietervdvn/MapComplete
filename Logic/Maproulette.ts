import Constants from "../Models/Constants";

export default class Maproulette {
  /**
   * The API endpoint to use
   */
  endpoint: string;

  /**
   * The API key to use for all requests
   */
  private apiKey: string;

  /**
   * Creates a new Maproulette instance
   * @param endpoint The API endpoint to use
   */
  constructor(endpoint: string = "https://maproulette.org/api/v2") {
    this.endpoint = endpoint;
    this.apiKey = Constants.MaprouletteApiKey;
  }

  /**
   * Close a task
   * @param taskId The task to close
   */
  async closeTask(taskId: number): Promise<void> {
    const response = await fetch(`${this.endpoint}/task/${taskId}/1`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "apiKey": this.apiKey,
      },
    });
    if (response.status !== 304) {
      console.log(`Failed to close task: ${response.status}`);
    }
  }
}
