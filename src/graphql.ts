import { request as Request } from "@octokit/request";
import { GraphqlError } from "./error";
import { Endpoint, Parameters, GraphQlQueryResponse, GraphQlQueryResponseData } from "./types";

const NON_VARIABLE_OPTIONS = [
  "method",
  "baseUrl",
  "url",
  "headers",
  "request",
  "query"
];

export function graphql(
  request: typeof Request,
  query: string | Parameters,
  options?: Parameters
): Promise<GraphQlQueryResponseData> {
  options =
    typeof query === "string"
      ? (options = Object.assign({ query }, options))
      : (options = query);

  const requestOptions = Object.keys(options).reduce<Endpoint>(
    (result, key) => {
      if (NON_VARIABLE_OPTIONS.includes(key)) {
        result[key] = options![key];
        return result;
      }

      if (!result.variables) {
        result.variables = {};
      }

      result.variables[key] = options![key];
      return result;
    },
    {} as Endpoint
  );

  return request(requestOptions).then(response => {
    if (response.data.errors) {
      throw new GraphqlError(requestOptions, {
        data: response.data as Required<GraphQlQueryResponse>
      });
    }

    return response.data.data;
  });
}
