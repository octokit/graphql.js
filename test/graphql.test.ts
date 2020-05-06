import fetchMock from "fetch-mock";
import { getUserAgent } from "universal-user-agent";
import * as OctokitTypes from "@octokit/types";

import { graphql } from "../src";

import { VERSION } from "../src/version";
const userAgent = `octokit-graphql.js/${VERSION} ${getUserAgent()}`;

import { RequestParameters } from "../src/types";

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
                        }
                    ),
                },
            }
        ).then((result) => {
            expect(result).toStrictEqual(mockData);
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
                fetch: fetchMock.sandbox().post("https://api.github.com/graphql", (url, options: OctokitTypes.RequestOptions) => {
                    const body = JSON.parse(options.body);
                    expect(body.query).toEqual(query);
                    expect(body.variables).toStrictEqual({
                        owner: "octokit",
                        repo: "graphql.js",
                    });

                    return { data: {} };
                }),
            },
        });
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
                fetch: fetchMock.sandbox().post("https://api.github.com/graphql", (url, options: OctokitTypes.RequestOptions) => {
                    const body = JSON.parse(options.body);
                    expect(body.query).toEqual(query);
                    expect(body.variables).toStrictEqual({
                        owner: "octokit",
                        repo: "graphql.js",
                    });

                    return { data: {} };
                }),
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
                fetch: fetchMock.sandbox().post("https://api.github.com/graphql", (url, options: OctokitTypes.RequestOptions) => {
                    const body = JSON.parse(options.body);
                    expect(body.query).toEqual(query);
                    expect(body.variables).toEqual(undefined);

                    return { data: {} };
                }),
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
                fetch: fetchMock.sandbox().post("https://api.github.com/graphql", (url, options: OctokitTypes.RequestOptions) => {
                    expect(options.headers.accept).toContain("antiope-preview");
                    expect(options.headers.accept).toContain("testpkg-preview");
                    return { data: {} };
                }),
            },
        });
    });
});
