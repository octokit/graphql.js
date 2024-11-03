import { request as Request } from "@octokit/request";
import type {
  graphql as ApiInterface,
  Query,
  RequestParameters,
} from "./types.js";
import { graphql } from "./graphql.js";
import type { DocumentTypeDecoration } from "@graphql-typed-document-node/core";

/**
 * Allows discarding the DocumentTypeDecoration information from the external
 * interface, and casting the String part to string. This avoids the external
 * API interface spreading to the internal types, while keeping type-safety for
 * future extensions/changes.
 */
type DiscardTypeDecoration<T> = T extends String &
  DocumentTypeDecoration<unknown, unknown>
  ? string
  : T;

export function withDefaults(
  request: typeof Request,
  newDefaults: RequestParameters,
): ApiInterface {
  const newRequest = request.defaults(newDefaults);
  const newApi = <ResponseData>(
    query:
      | Query
      | (String & DocumentTypeDecoration<unknown, unknown>)
      | RequestParameters,
    options?: RequestParameters,
  ) => {
    return graphql<ResponseData>(
      newRequest,
      query as DiscardTypeDecoration<typeof query>,
      options,
    );
  };

  return Object.assign(newApi, {
    defaults: withDefaults.bind(null, newRequest),
    endpoint: newRequest.endpoint,
  });
}
