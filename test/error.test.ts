import fetchMock from "fetch-mock";

import { graphql, GraphqlResponseError } from "../src";

describe("errors", () => {
  it("Invalid query", () => {
    const query = `{
  viewer {
    bioHtml
  }
}`;
    const mockResponse = {
      data: null,
      errors: [
        {
          locations: [
            {
              column: 5,
              line: 3,
            },
          ],
          message: "Field 'bioHtml' doesn't exist on type 'User'",
        },
      ],
    };

    return graphql(query, {
      headers: {
        authorization: `token secret123`,
      },
      request: {
        fetch: fetchMock
          .sandbox()
          .post("https://api.github.com/graphql", mockResponse),
      },
    })
      .then(() => {
        throw new Error("Should not resolve");
      })

      .catch((error) => {
        expect(error.message).toEqual(
          "Request failed due to following response errors:\n" +
            " - Field 'bioHtml' doesn't exist on type 'User'"
        );
        expect(JSON.stringify(error.errors)).toStrictEqual(
          JSON.stringify(mockResponse.errors)
        );
        expect(error.request.query).toEqual(query);
      });
  });

  it("Should be able check if an error is instance of a GraphQL response error", () => {
    const query = `{
      repository {
        name
      }
    }`;

    const mockResponse = {
      data: null,
      errors: [
        {
          locations: [
            {
              column: 5,
              line: 3,
            },
          ],
          message: "Some error message",
        },
      ],
    };

    return graphql(query, {
      headers: {
        authorization: `token secret123`,
      },
      request: {
        fetch: fetchMock
          .sandbox()
          .post("https://api.github.com/graphql", mockResponse),
      },
    })
      .then(() => {
        throw new Error("Should not resolve");
      })

      .catch((error) => {
        expect(error instanceof GraphqlResponseError).toBe(true);
      });
  });

  it("Should throw an error for a partial response accompanied by errors", () => {
    const query = `{
      repository(name: "probot", owner: "probot") {
        name
        ref(qualifiedName: "master") {
          target {
            ... on Commit {
              history(first: 25, after: "invalid cursor") {
                nodes {
                  message
                }
              }
            }
          }
        }
      }
    }`;

    const mockResponse = {
      data: {
        repository: {
          name: "probot",
          ref: null,
        },
      },
      errors: [
        {
          locations: [
            {
              column: 11,
              line: 7,
            },
          ],
          message: "`invalid cursor` does not appear to be a valid cursor.",
          path: ["repository", "ref", "target", "history"],
          type: "INVALID_CURSOR_ARGUMENTS",
        },
      ],
    };

    return graphql(query, {
      headers: {
        authorization: `token secret123`,
      },
      request: {
        fetch: fetchMock.sandbox().post("https://api.github.com/graphql", {
          body: mockResponse,
          headers: {
            "x-github-request-id": "C5E6:259A:1351B40:2E88B87:5F1F9C41",
          },
        }),
      },
    })
      .then(() => {
        throw new Error("Should not resolve");
      })
      .catch((error) => {
        expect(error.message).toEqual(
          "Request failed due to following response errors:\n" +
            " - `invalid cursor` does not appear to be a valid cursor."
        );
        expect(JSON.stringify(error.errors)).toStrictEqual(
          JSON.stringify(mockResponse.errors)
        );
        expect(error.request.query).toEqual(query);
        expect(JSON.stringify(error.data)).toStrictEqual(
          JSON.stringify(mockResponse.data)
        );
        expect(error.headers).toHaveProperty("x-github-request-id");
        expect(error.headers["x-github-request-id"]).toEqual(
          "C5E6:259A:1351B40:2E88B87:5F1F9C41"
        );
      });
  });

  it("Should throw for server error", () => {
    const query = `{
      viewer {
        login
      }
    }`;

    return graphql(query, {
      headers: {
        authorization: `token secret123`,
      },
      request: {
        fetch: fetchMock.sandbox().post("https://api.github.com/graphql", 500),
      },
    })
      .then(() => {
        throw new Error("Should not resolve");
      })
      .catch((error) => {
        expect(error.status).toEqual(500);
      });
  });
});
