import { request as Request } from "@octokit/request";
import type {
  graphql as ApiInterface,
  Query,
  RequestParameters,
} from "./types.js";
import { graphql } from "./graphql.js";
import type { DocumentTypeDecoration } from "@graphql-typed-document-node/core";

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
    const innerQuery =
      typeof query === "string"
        ? query
        : // Allows casting String & DocumentTypeDecoration<unknown, unknown> to
          // string. This could be replaced with an instanceof check if we had
          // access to a shared TypedDocumentString. Alternatively, we could use
          // string & TypedDocumentDecoration<unknown, unknown> as the external
          // interface, and push `.toString()` onto the caller, which might not
          // be the worst idea.
          String.prototype.isPrototypeOf(query)
          ? query.toString()
          : (query as RequestParameters);

    return graphql<ResponseData>(newRequest, innerQuery, options);
  };

  return Object.assign(newApi, {
    defaults: withDefaults.bind(null, newRequest),
    endpoint: newRequest.endpoint,
  });
}
