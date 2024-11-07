import type {
  EndpointOptions,
  RequestParameters as RequestParametersType,
  EndpointInterface,
} from "@octokit/types";

import type { DocumentTypeDecoration } from "@graphql-typed-document-node/core";

import type { graphql } from "./graphql.js";

export type GraphQlEndpointOptions = EndpointOptions & {
  variables?: { [key: string]: unknown };
};
export type RequestParameters = RequestParametersType;

export type Query = string;

export interface graphql {
  /**
   * Sends a GraphQL query request based on endpoint options
   * The GraphQL query must be specified in `options`.
   *
   * @param {object} endpoint Must set `method` and `url`. Plus URL, query or body parameters, as well as `headers`, `mediaType.{format|previews}`, `request`, or `baseUrl`.
   */
  <ResponseData>(options: RequestParameters): GraphQlResponse<ResponseData>;

  /**
   * Sends a GraphQL query request based on endpoint options
   *
   * @param {string} query GraphQL query. Example: `'query { viewer { login } }'`.
   * @param {object} [parameters] URL, query or body parameters, as well as `headers`, `mediaType.{format|previews}`, `request`, or `baseUrl`.
   */
  <ResponseData>(
    query: Query,
    parameters?: RequestParameters,
  ): GraphQlResponse<ResponseData>;

  /**
   * Sends a GraphQL query request based on endpoint options. The query parameters are type-checked
   *
   * @param {String & DocumentTypeDecoration<ResponseData, QueryVariables>} query GraphQL query. Example: `'query { viewer { login } }'`.
   * @param {object} [parameters] URL, query or body parameters, as well as `headers`, `mediaType.{format|previews}`, `request`, or `baseUrl`.
   */
  <ResponseData, QueryVariables>(
    query: String & DocumentTypeDecoration<ResponseData, QueryVariables>,
    /**
     * The tuple in rest parameters allows makes RequestParameters conditionally
     * optional , if the query does not require any variables.
     *
     * @see https://github.com/Microsoft/TypeScript/pull/24897#:~:text=not%20otherwise%20observable).-,Optional%20elements%20in%20tuple%20types,-Tuple%20types%20now
     */
    ...[parameters]: QueryVariables extends Record<string, never>
      ? [RequestParameters?]
      : [QueryVariables & RequestParameters]
  ): GraphQlResponse<ResponseData>;

  /**
   * Returns a new `endpoint` with updated route and parameters
   */
  defaults: (newDefaults: RequestParameters) => graphql;

  /**
   * Octokit endpoint API, see {@link https://github.com/octokit/endpoint.js|@octokit/endpoint}
   */
  endpoint: EndpointInterface;
}

// export type withCustomRequest = (request: typeof Request) => graphql;

export type GraphQlResponse<ResponseData> = Promise<ResponseData>;

export type GraphQlQueryResponseData = {
  [key: string]: any;
};

export type GraphQlQueryResponse<ResponseData> = {
  data: ResponseData;
  errors?: [
    {
      // https://github.com/octokit/graphql.js/pull/314
      type: string;
      message: string;
      path: [string];
      extensions: { [key: string]: any };
      locations: [
        {
          line: number;
          column: number;
        },
      ];
    },
  ];
};
