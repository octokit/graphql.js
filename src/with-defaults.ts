import { request as Request } from "@octokit/request";
import type {
  graphql as ApiInterface,
  Query,
  RequestParameters,
} from "./types.js";
import { graphql } from "./graphql.js";

export function withDefaults(
  request: typeof Request,
  newDefaults: RequestParameters,
): ApiInterface {
  const newRequest = request.defaults(newDefaults);
  const newApi = <ResponseData>(
    query: Query | RequestParameters,
    options?: RequestParameters,
  ) => {
    return graphql<ResponseData>(newRequest, query, options);
  };

  return Object.assign(newApi, {
    defaults: withDefaults.bind(null, newRequest),
    endpoint: newRequest.endpoint,
  });
}
