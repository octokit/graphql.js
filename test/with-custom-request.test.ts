import fetchMock from "fetch-mock";
import { request } from "@octokit/request";

import { withCustomRequest } from "../src";

describe("withCustomRequest()", () => {
  it("README example", () => {
    const myRequest = request.defaults({
      headers: {
        authorization: "token secret123",
        "user-agent": "test",
      },
    });
    const myGraphql = withCustomRequest(myRequest);

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
          "user-agent": "test",
        },
      },
    );

    return myGraphql(
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
});
