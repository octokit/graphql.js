import { request as Request } from "@octokit/request";
import { ResponseHeaders } from "@octokit/types";
import { GraphqlError } from "./error";
import {
  GraphQlEndpointOptions,
  RequestParameters,
  GraphQlQueryResponse,
  GraphQlQueryResponseData,
} from "./types";

const NON_VARIABLE_OPTIONS = [
  "method",
  "baseUrl",
  "url",
  "headers",
  "request",
  "query",
  "mediaType",
];

const FORBIDDEN_VARIABLE_OPTIONS = ["query", "method", "url"];

const GHES_V3_SUFFIX_REGEX = /\/api\/v3\/?$/;

export function graphql<ResponseData = GraphQlQueryResponseData>(
  request: typeof Request,
  query: string | RequestParameters,
  options?: RequestParameters
): Promise<ResponseData> {
  if (options) {
    if (typeof query === "string" && "query" in options) {
      return Promise.reject(
        new Error(`[@octokit/graphql] "query" cannot be used as variable name`)
      );
    }

    for (const key in options) {
      if (!FORBIDDEN_VARIABLE_OPTIONS.includes(key)) continue;

      return Promise.reject(
        new Error(`[@octokit/graphql] "${key}" cannot be used as variable name`)
      );
    }
  }

  const parsedOptions =
    typeof query === "string" ? Object.assign({ query }, options) : query;

  const requestOptions = Object.keys(
    parsedOptions
  ).reduce<GraphQlEndpointOptions>((result, key) => {
    if (NON_VARIABLE_OPTIONS.includes(key)) {
      result[key] = parsedOptions[key];
      return result;
    }

    if (!result.variables) {
      result.variables = {};
    }

    result.variables[key] = parsedOptions[key];
    return result;
  }, {} as GraphQlEndpointOptions);

  // workaround for GitHub Enterprise baseUrl set with /api/v3 suffix
  // https://github.com/octokit/auth-app.js/issues/111#issuecomment-657610451
  const baseUrl = parsedOptions.baseUrl || request.endpoint.DEFAULTS.baseUrl;
  if (GHES_V3_SUFFIX_REGEX.test(baseUrl)) {
    requestOptions.url = baseUrl.replace(GHES_V3_SUFFIX_REGEX, "/api/graphql");
  }

  return request(requestOptions).then((response) => {
    if (response.data.errors) {
      const headers: ResponseHeaders = {};
      for (const key of Object.keys(response.headers)) {
        headers[key] = response.headers[key];
      }

      throw new GraphqlError(requestOptions, {
        headers,
        data: response.data as Required<GraphQlQueryResponse<ResponseData>>,
      });
    }

    return response.data.data;
  });
}
