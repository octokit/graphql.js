import { request as Request } from "@octokit/request";
import {
  graphql as ApiInterface,
  Query,
  Parameters,
  GraphQlQueryResponse
} from "./types";
import { graphql } from "./graphql";

export function withDefaults(
  request: typeof Request,
  newDefaults: Parameters
): ApiInterface {
  const newRequest = request.defaults(newDefaults);
  const newApi = <T extends GraphQlQueryResponse>(query: Query | Parameters, options?: Parameters) => {
    return graphql<T>(newRequest, query, options);
  };

  return Object.assign(newApi, {
    defaults: withDefaults.bind(null, newRequest),
    endpoint: Request.endpoint
  });
}
