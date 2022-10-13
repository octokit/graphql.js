import fetchMock from "fetch-mock";
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

    const authenticatedGraphql = graphql.defaults({
      headers: {
        authorization: `token secret123`,
      },
      request: {
        fetch: fetchMock.sandbox().post(
          "https://api.github.com/graphql",
          { data: mockData },
          {
            headers: {
              authorization: "token secret123",
            },
          }
        ),
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
      expect(result).toStrictEqual(mockData);
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

    const authenticatedGraphql = graphql.defaults({
      headers: {
        authorization: `token secret123`,
      },
      request: {
        fetch: fetchMock.sandbox().post(
          "https://github.acme-inc.com/api/graphql",
          { data: mockData },
          {
            headers: {
              authorization: "token secret123",
            },
          }
        ),
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
      expect(result).toStrictEqual(mockData);
    });
  });

  it("handle baseUrl set with /api/v3 suffix", () => {
    const ghesGraphQl = graphql.defaults({
      baseUrl: "https://github.acme-inc.com/api/v3",
      headers: {
        authorization: `token secret123`,
      },
      request: {
        fetch: fetchMock.sandbox().post(
          "https://github.acme-inc.com/api/graphql",
          { data: { ok: true } },
          {
            headers: {
              authorization: "token secret123",
            },
          }
        ),
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
        fetch: fetchMock.sandbox().post(
          "https://github.acme-inc.com/api/graphql",
          { data: mockData },
          {
            headers: {
              authorization: "token secret123",
            },
          }
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
});
