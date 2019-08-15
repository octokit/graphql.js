import { request as Request } from "@octokit/request";
import { Endpoint, Parameters, GraphQlQueryResponse } from "./types";
import { graphql } from "./graphql";

export function withDefaults(
  request: typeof Request,
  newDefaults: Parameters
): typeof Request {
  const newRequest = request.defaults(newDefaults);
  const newApi = function<T extends GraphQlQueryResponse>(
    query: string | Endpoint,
    options?: Parameters
  ) {
    return graphql<T>(newRequest, query, options);
  };

  return Object.assign(newApi, {
    defaults: withDefaults.bind(null, newRequest),
    endpoint: Request.endpoint
  });
}
