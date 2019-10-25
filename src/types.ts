import * as OctokitTypes from "@octokit/types";

import { graphql } from "./graphql";

export type EndpointOptions = OctokitTypes.EndpointOptions;
export type RequestParameters = OctokitTypes.RequestParameters;

export type Query = string;

export interface graphql {
  /**
   * Sends a GraphQL query request based on endpoint options
   * The GraphQL query must be specified in `options`.
   *
   * @param {object} endpoint Must set `method` and `url`. Plus URL, query or body parameters, as well as `headers`, `mediaType.{format|previews}`, `request`, or `baseUrl`.
   */
  (options: OctokitTypes.RequestParameters): GraphQlResponse;

  /**
   * Sends a GraphQL query request based on endpoint options
   *
   * @param {string} query GraphQL query. Example: `'query { viewer { login } }'`.
   * @param {object} [parameters] URL, query or body parameters, as well as `headers`, `mediaType.{format|previews}`, `request`, or `baseUrl`.
   */
  (query: Query, parameters?: OctokitTypes.RequestParameters): GraphQlResponse;

  /**
   * Returns a new `endpoint` with updated route and parameters
   */
  defaults: (newDefaults: OctokitTypes.RequestParameters) => graphql;

  /**
   * Octokit endpoint API, see {@link https://github.com/octokit/endpoint.js|@octokit/endpoint}
   */
  endpoint: OctokitTypes.EndpointInterface;
}

// export type withCustomRequest = (request: typeof Request) => graphql;

export type GraphQlResponse = ReturnType<typeof graphql>;

export type GraphQlQueryResponseData = {
  [key: string]: any;
} | null;

export type GraphQlQueryResponse = {
  data: GraphQlQueryResponseData;
  errors?: [
    {
      message: string;
      path: [string];
      extensions: { [key: string]: any };
      locations: [
        {
          line: number;
          column: number;
        }
      ];
    }
  ];
};
