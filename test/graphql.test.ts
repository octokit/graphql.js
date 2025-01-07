import { describe, expect, it } from "vitest";
import fetchMock from "fetch-mock";
import { getUserAgent } from "universal-user-agent";

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

    const mock = fetchMock.createInstance().post(
      "https://api.github.com/graphql",
      { data: mockData },
      {
        headers: {
          accept: "application/vnd.github.v3+json",
          authorization: "token secret123",
          "user-agent": userAgent,
        },
      },
    );

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
          fetch: mock.fetchHandler,
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

    const mock = fetchMock.createInstance().post(
      "https://api.github.com/graphql",
      { data: mockData },
      {
        headers: {
          accept: "application/vnd.github.v3+json",
          authorization: "token secret123",
          "user-agent": userAgent,
        },
      },
    );

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
        fetch: mock.fetchHandler,
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

    const mock = fetchMock
      .createInstance()
      .post("https://api.github.com/graphql", (_url: any) => {
        //@ts-ignore mock.fetchHandler is not typed
        const body = JSON.parse(mock.callHistory.calls()[0].options.body);
        expect(body.query).toEqual(query);
        expect(body.variables).toStrictEqual({
          owner: "octokit",
          repo: "graphql.js",
        });

        return { data: {} };
      });

    return graphql(query, {
      headers: {
        authorization: `token secret123`,
      },
      owner: "octokit",
      repo: "graphql.js",
      request: {
        fetch: mock.fetchHandler,
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

    const mock = fetchMock
      .createInstance()
      .post("https://api.github.com/graphql", (callHistory) => {
        //@ts-ignore mock.fetchHandler is not typed
        const body = JSON.parse(mock.callHistory.calls()[0].options.body);
        expect(body.query).toEqual(query.toString());
        expect(body.variables).toStrictEqual({
          owner: "octokit",
          repo: "graphql.js",
        });

        return { data: {} };
      });

    return graphql(query, {
      headers: {
        authorization: `token secret123`,
      },
      owner: "octokit",
      repo: "graphql.js",
      request: {
        fetch: mock.fetchHandler,
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

    const mock = fetchMock
      .createInstance()
      .post("https://api.github.com/graphql", (_url: any) => {
        //@ts-ignore mock.fetchHandler is not typed
        const body = JSON.parse(mock.callHistory.calls()[0].options.body);
        expect(body.query).toEqual(query);
        expect(body.variables).toStrictEqual({
          owner: "octokit",
          repo: "graphql.js",
        });
        expect(options.headers!.authorization).toEqual("token secret123");
        // @ts-ignore `request.headers` are typed incorrectly by fetch-mock
        const custom = mock.callHistory.calls()[0].options.headers!["x-custom"];
        expect(custom).toContain("value");
        return { data: {} };
      });

    const options: RequestParameters = {
      headers: {
        authorization: `token secret123`,
        "x-custom": "value",
      },
      owner: "octokit",
      repo: "graphql.js",
      request: {
        fetch: mock.fetchHandler,
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

    const mock = fetchMock
      .createInstance()
      .post("https://api.github.com/graphql", (_url: any) => {
        //@ts-ignore mock.fetchHandler is not typed
        const body = JSON.parse(mock.callHistory.calls()[0].options.body);
        expect(body.query).toEqual(query);
        expect(body.variables).toStrictEqual({
          owner: "octokit",
          repo: "graphql.js",
        });

        return { data: {} };
      });

    const options: RequestParameters = {
      headers: {
        authorization: `token secret123`,
      },
      owner: "octokit",
      query,
      repo: "graphql.js",
      request: {
        fetch: mock.fetchHandler,
      },
    };

    return graphql(options);
  });

  it("Don’t send empty variables object", () => {
    const query = "{ viewer { login } }";

    const mock = fetchMock
      .createInstance()
      .post("https://api.github.com/graphql", (_url: any) => {
        //@ts-ignore mock.fetchHandler is not typed
        const body = JSON.parse(mock.callHistory.calls()[0].options.body);
        expect(body.query).toEqual(query);
        expect(body.variables).toEqual(undefined);
        return { data: {} };
      });

    return graphql(query, {
      headers: {
        authorization: `token secret123`,
      },
      request: {
        fetch: mock.fetchHandler,
      },
    });
  });

  it("MediaType previews are added to header", async () => {
    const query = `{ viewer { login } }`;

    // Create a new FetchMock instance
    const mock = fetchMock
      .createInstance()
      .postOnce("https://api.github.com/graphql", (_url: any) => {
        // @ts-ignore `request.headers` are typed incorrectly by fetch-mock
        const accept = mock.callHistory.calls()[0].options.headers["accept"];
        expect(accept).toContain("antiope-preview");
        expect(accept).toContain("testpkg-preview");
        return {
          status: 200,
          body: { data: {} },
        };
      });

    // Perform the GraphQL request using mock.fetchHandler
    const response = await graphql(query, {
      headers: {
        authorization: `token secret123`,
      },
      mediaType: { previews: ["antiope", "testpkg"] },
      request: {
        fetch: mock.fetchHandler,
      },
    });

    expect(response).toEqual({});
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
