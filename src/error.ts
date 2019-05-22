import {
  OctokitResponse,
  request as Request
} from "@octokit/request/dist-types/types";
import { GraphQlQueryResponse } from "./types";

export class GraphqlError<T extends GraphQlQueryResponse> extends Error {
  public request: Request;
  constructor(request: Request, response: OctokitResponse<T>) {
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
