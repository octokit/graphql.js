import { ResponseHeaders } from "@octokit/types";
import { GraphQlEndpointOptions, GraphQlQueryResponse, GraphQlQueryResponseData, GraphQlResponse } from "./types";

type ServerResponseData<T> = Required<GraphQlQueryResponse<T>>;

function _buildMessageForResponseErrors(data: ServerResponseData<unknown>): string {
  return `Request failed due to following response errors: ` +
    data.errors.map(e => ` - ${e.message}`).join('\n');
}

export class GraphqlResponseError<ResponseData> extends Error {
  override name = 'GraphqlResponseError';

  readonly errors: GraphQlQueryResponse<never>["errors"];
  readonly data: ResponseData;

  constructor(
      readonly request: GraphQlEndpointOptions,
      readonly headers: ResponseHeaders,
      readonly response: ServerResponseData<ResponseData>) {
    super(_buildMessageForResponseErrors(response));

    // Expose the errors and response data in their shorthand properties.
    this.errors = response.errors;
    this.data = response.data;

    // Maintains proper stack trace (only available on V8)
    /* istanbul ignore next */
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}