import fetchMock from "fetch-mock";
import { getUserAgent } from "universal-user-agent";
import type * as OctokitTypes from "@octokit/types";

import { graphql } from "../src";
import { VERSION } from "../src/version";
import type { RequestParameters } from "../src/types";
import type { DocumentTypeDecoration } from "@graphql-typed-document-node/core";

const userAgent = `octokit-graphql.js/${VERSION} ${getUserAgent()}`;

class TypedDocumentString<TResult, TVariables>
  extends String
  implements DocumentTypeDecoration<TResult, TVariables>
{
  __apiType?: DocumentTypeDecoration<TResult, TVariables>["__apiType"];

  constructor(private value: string) {
    super(value);
  }

  toString(): string & DocumentTypeDecoration<TResult, TVariables> {
    return this.value;
  }
}

describe("graphql()", () => {
  it("is a function", () => {
    expect(graphql).toBeInstanceOf(Function);
  });

  it("README simple query example", () => {
    const mockData = {
      repository: {
        issues: {
          edges: [
            {
              node: {
                title: "Foo",
              },
            },
            {
              node: {
                title: "Bar",
              },
            },
            {
              node: {
                title: "Baz",
              },
            },
          ],
        },
      },
    };

    return graphql(
      `
        {
          repository(owner: "octokit", name: "graphql.js") {
            issues(last: 3) {
              edges {
                node {
                  title
                }
              }
            }
          }
        }
      `,
      {
        headers: {
          authorization: `token secret123`,
        },
        request: {
          fetch: fetchMock.sandbox().post(
            "https://api.github.com/graphql",
            { data: mockData },
            {
              headers: {
                accept: "application/vnd.github.v3+json",
                authorization: "token secret123",
                "user-agent": userAgent,
              },
            },
          ),
        },
      },
    ).then((result) => {
      expect(JSON.stringify(result)).toStrictEqual(JSON.stringify(mockData));
    });
  });

  it("README TypedDocumentString example", () => {
    const mockData = {
      repository: {
        issues: {
          edges: [
            {
              node: {
                title: "Foo",
              },
            },
            {
              node: {
                title: "Bar",
              },
            },
            {
              node: {
                title: "Baz",
              },
            },
          ],
        },
      },
    };

    const RepositoryDocument = new TypedDocumentString<
      {
        repository: { issues: { edges: Array<{ node: { title: string } }> } };
      },
      Record<string, never>
    >(/* GraphQL */ `
      {
        repository(owner: "octokit", name: "graphql.js") {
          issues(last: 3) {
            edges {
              node {
                title
              }
            }
          }
        }
      }
    `);

    return graphql(RepositoryDocument, {
      headers: {
        authorization: `token secret123`,
      },
      request: {
        fetch: fetchMock.sandbox().post(
          "https://api.github.com/graphql",
          { data: mockData },
          {
            headers: {
              accept: "application/vnd.github.v3+json",
              authorization: "token secret123",
              "user-agent": userAgent,
            },
          },
        ),
      },
    }).then((result) => {
      expect(JSON.stringify(result)).toStrictEqual(JSON.stringify(mockData));
    });
  });

  it("Variables", () => {
    const query = `query lastIssues($owner: String!, $repo: String!, $num: Int = 3) {
      repository(owner:$owner, name:$repo) {
        issues(last:$num) {
          edges {
            node {
              title
            }
          }
        }
      }
    }`;

    return graphql(query, {
      headers: {
        authorization: `token secret123`,
      },
      owner: "octokit",
      repo: "graphql.js",
      request: {
        fetch: fetchMock
          .sandbox()
          .post(
            "https://api.github.com/graphql",
            (_url, options: OctokitTypes.RequestOptions) => {
              const body = JSON.parse(options.body);
              expect(body.query).toEqual(query);
              expect(body.variables).toStrictEqual({
                owner: "octokit",
                repo: "graphql.js",
              });

              return { data: {} };
            },
          ),
      },
    });
  });

  it("Variables with TypedDocumentString", () => {
    const query = new TypedDocumentString<
      {
        repository: { issues: { edges: Array<{ node: { title: string } }> } };
      },
      {
        owner: string;
        repo: string;
        num?: number;
      }
    >(`query lastIssues($owner: String!, $repo: String!, $num: Int = 3) {
      repository(owner:$owner, name:$repo) {
        issues(last:$num) {
          edges {
            node {
              title
            }
          }
        }
      }
    }`);

    return graphql(query, {
      headers: {
        authorization: `token secret123`,
      },
      owner: "octokit",
      repo: "graphql.js",
      request: {
        fetch: fetchMock
          .sandbox()
          .post(
            "https://api.github.com/graphql",
            (_url, options: OctokitTypes.RequestOptions) => {
              const body = JSON.parse(options.body);
              expect(body.query).toEqual(query.toString());
              expect(body.variables).toStrictEqual({
                owner: "octokit",
                repo: "graphql.js",
              });

              return { data: {} };
            },
          ),
      },
    });
  });

  it("Pass headers together with variables as 2nd argument", () => {
    const query = `query lastIssues($owner: String!, $repo: String!, $num: Int = 3) {
      repository(owner:$owner, name:$repo) {
        issues(last:$num) {
          edges {
            node {
              title
            }
          }
        }
      }
    }`;

    const options: RequestParameters = {
      headers: {
        authorization: `token secret123`,
        "x-custom": "value",
      },
      owner: "octokit",
      repo: "graphql.js",
      request: {
        fetch: fetchMock
          .sandbox()
          .post(
            "https://api.github.com/graphql",
            (_url, options: OctokitTypes.RequestOptions) => {
              const body = JSON.parse(options.body);
              expect(body.query).toEqual(query);
              expect(body.variables).toStrictEqual({
                owner: "octokit",
                repo: "graphql.js",
              });
              expect(options.headers["authorization"]).toEqual(
                "token secret123",
              );
              expect(options.headers["x-custom"]).toEqual("value");

              return { data: {} };
            },
          ),
      },
    };

    return graphql(query, options);
  });

  it("Pass query together with headers and variables", () => {
    const query = `query lastIssues($owner: String!, $repo: String!, $num: Int = 3) {
      repository(owner:$owner, name:$repo) {
        issues(last:$num) {
          edges {
            node {
              title
            }
          }
        }
      }
    }`;

    const options: RequestParameters = {
      headers: {
        authorization: `token secret123`,
      },
      owner: "octokit",
      query,
      repo: "graphql.js",
      request: {
        fetch: fetchMock
          .sandbox()
          .post(
            "https://api.github.com/graphql",
            (_url, options: OctokitTypes.RequestOptions) => {
              const body = JSON.parse(options.body);
              expect(body.query).toEqual(query);
              expect(body.variables).toStrictEqual({
                owner: "octokit",
                repo: "graphql.js",
              });

              return { data: {} };
            },
          ),
      },
    };

    return graphql(options);
  });

  it("Don’t send empty variables object", () => {
    const query = "{ viewer { login } }";

    return graphql(query, {
      headers: {
        authorization: `token secret123`,
      },
      request: {
        fetch: fetchMock
          .sandbox()
          .post(
            "https://api.github.com/graphql",
            (_url, options: OctokitTypes.RequestOptions) => {
              const body = JSON.parse(options.body);
              expect(body.query).toEqual(query);
              expect(body.variables).toEqual(undefined);

              return { data: {} };
            },
          ),
      },
    });
  });

  it("MediaType previews are added to header", () => {
    const query = `{ viewer { login } }`;

    return graphql(query, {
      headers: {
        authorization: `token secret123`,
      },
      owner: "octokit",
      repo: "graphql.js",
      mediaType: { previews: ["antiope", "testpkg"] },
      request: {
        fetch: fetchMock
          .sandbox()
          .post(
            "https://api.github.com/graphql",
            (_url, options: OctokitTypes.RequestOptions) => {
              expect(options.headers.accept).toContain("antiope-preview");
              expect(options.headers.accept).toContain("testpkg-preview");
              return { data: {} };
            },
          ),
      },
    });
  });

  it("query variable (#166)", () => {
    expect.assertions(1);

    const query = `query search($query: String!) {
      search(query: $query, first: 10, type: ISSUE) {
        edges {
          node {
            ... on PullRequest {
              title
            }
          }
        }
      }
    }`;

    return graphql(query, {
      headers: {
        authorization: `token secret123`,
      },
      query: "test",
    }).catch((error) => {
      expect(error.message).toEqual(
        `[@octokit/graphql] "query" cannot be used as variable name`,
      );
    });
  });

  it("url variable (#264)", () => {
    expect.assertions(1);

    const query = `query GetCommitStatus($url: URI!) {
      resource(url: $url) {
        ... on Commit {
          status {
            state
          }
        }
      }
    }`;

    return graphql(query, {
      url: "https://example.com",
    }).catch((error) => {
      expect(error.message).toEqual(
        `[@octokit/graphql] "url" cannot be used as variable name`,
      );
    });
  });

  it("method variable", () => {
    expect.assertions(1);

    const query = `query($method:String!){
      search(query:$method,type:ISSUE) {
        codeCount
      }
    }`;

    return graphql(query, {
      method: "test",
    }).catch((error) => {
      expect(error.message).toEqual(
        `[@octokit/graphql] "method" cannot be used as variable name`,
      );
    });
  });
});
