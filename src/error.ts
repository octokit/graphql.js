import { OctokitResponse, Endpoint, GraphQlQueryResponse } from "./types";

export class GraphqlError<T extends GraphQlQueryResponse> extends Error {
  public request: Endpoint;
  constructor(request: Endpoint, response: OctokitResponse<T>) {
    const message = response.data ? response.data.errors![0].message : "ERROR";
    super(message);

    Object.assign(this, response.data);
    this.name = "GraphqlError";
    this.request = request;

    // Maintains proper stack trace (only available on V8)
    /* istanbul ignore next */
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}
