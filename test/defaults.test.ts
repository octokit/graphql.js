import { describe, expect, it } from "vitest";
import fetchMock, { type CallLog } from "fetch-mock";
import { getUserAgent } from "universal-user-agent";

import { VERSION } from "../src/version";
import { graphql } from "../src";

const userAgent = `octokit-graphql.js/${VERSION} ${getUserAgent()}`;

describe("graphql.defaults()", () => {
  it("is a function", () => {
    expect(graphql.defaults).toBeInstanceOf(Function);
  });

  it("README example", () => {
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
          authorization: "token secret123",
        },
      },
    );

    const authenticatedGraphql = graphql.defaults({
      headers: {
        authorization: `token secret123`,
      },
      request: {
        fetch: mock.fetchHandler,
      },
    });
    return authenticatedGraphql(`{
      repository(owner:"octokit", name:"graphql.js") {
        issues(last:3) {
          edges {
            node {
              title
            }
          }
        }
      }
    }`).then((result) => {
      expect(JSON.stringify(result)).toStrictEqual(JSON.stringify(mockData));
    });
  });

  it("repeated defaults", () => {
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
      "https://github.acme-inc.com/api/graphql",
      { data: mockData },
      {
        headers: {
          authorization: "token secret123",
        },
      },
    );

    const authenticatedGraphql = graphql.defaults({
      headers: {
        authorization: `token secret123`,
      },
      request: {
        fetch: mock.fetchHandler,
      },
    });
    const acmeGraphql = authenticatedGraphql.defaults({
      baseUrl: "https://github.acme-inc.com/api",
    });
    return acmeGraphql(`{
      repository(owner:"octokit", name:"graphql.js") {
        issues(last:3) {
          edges {
            node {
              title
            }
          }
        }
      }
    }`).then((result) => {
      expect(JSON.stringify(result)).toStrictEqual(JSON.stringify(mockData));
    });
  });

  it("handle baseUrl set with /api/v3 suffix", () => {
    const mock = fetchMock.createInstance().post(
      "https://github.acme-inc.com/api/graphql",
      { data: { ok: true } },
      {
        headers: {
          authorization: "token secret123",
        },
      },
    );

    const ghesGraphQl = graphql.defaults({
      baseUrl: "https://github.acme-inc.com/api/v3",
      headers: {
        authorization: `token secret123`,
      },
      request: {
        fetch: mock.fetchHandler,
      },
    });

    return ghesGraphQl(`query {
      viewer {
        login
      }
    }`);
  });

  it("set defaults on .endpoint", () => {
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

    const authenticatedGraphql = graphql.defaults({
      headers: {
        authorization: `token secret123`,
      },
      request: {
        fetch: fetchMock.createInstance().post(
          "https://github.acme-inc.com/api/graphql",
          { data: mockData },
          {
            headers: {
              authorization: "token secret123",
            },
          },
        ),
      },
    });

    const { request: _request, ...requestOptions } =
      // @ts-expect-error - TODO: expects to set { url } but it really shouldn't
      authenticatedGraphql.endpoint();
    expect(requestOptions).toStrictEqual({
      method: "POST",
      url: "https://api.github.com/graphql",
      headers: {
        accept: "application/vnd.github.v3+json",
        authorization: "token secret123",
        "user-agent": userAgent,
      },
    });
  });

  it("Allows user to specify non variable options", () => {
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

    const query = /* GraphQL */ `
        query Blue($last: Int) {
          repository(owner: "blue", name: "graphql.js") {
            issues(last: $last) {
              edges {
                node {
                  title
                }
              }
            }
          }
        }

        query Green($last: Int) {
          repository(owner: "green", name: "graphql.js") {
            issues(last: $last) {
              edges {
                node {
                  title
                }
              }
            }
          }
        }
        `.trim();

    const fetch = fetchMock.createInstance();

    fetch.post(
      "https://api.github.com/graphql",
      { data: mockData },
      {
        method: "POST",
        headers: {
          accept: "application/vnd.github.v3+json",
          authorization: "token secret123",
          "user-agent": userAgent,
        },
        matcherFunction: (callLog: CallLog) => {
          const expected = {
            query: query,
            operationName: "Blue",
            variables: { last: 3 },
          };
          const result = callLog.options.body === JSON.stringify(expected);
          if (!result) {
            console.warn("Body did not match expected value", {
              expected,
              actual: JSON.parse(callLog.options.body as string),
            });
          }
          return result;
        },
      },
    );

    const authenticatedGraphql = graphql.defaults({
      headers: {
        authorization: `token secret123`,
      },
      request: {
        fetch: fetch.fetchHandler,
      },
    });

    return new Promise<void>((res, rej) =>
      authenticatedGraphql({
        query,
        headers: {
          authorization: `token secret123`,
        },
        request: {
          fetch: fetch.fetchHandler,
        },
        operationName: "Blue",
        last: 3,
      })
        .then((result) => {
          expect(JSON.stringify(result)).toStrictEqual(
            JSON.stringify(mockData),
          );
          res();
        })
        .catch(() => {
          rej("Should have resolved");
        }),
    );
  });
});
