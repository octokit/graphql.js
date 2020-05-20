import { GraphQlEndpointOptions, GraphQlQueryResponse } from "./types";

export class GraphqlError<ResponseData> extends Error {
  public request: GraphQlEndpointOptions;
  constructor(
    request: GraphQlEndpointOptions,
    response: { data: Required<GraphQlQueryResponse<ResponseData>> }
  ) {
    const message = response.data.errors[0].message;
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
