import { describe, expect, it, vi } from "vitest";
import fetchMock from "fetch-mock";
import { request } from "@octokit/request";
import type { EndpointOptions } from "@octokit/types";

import { withCustomRequest } from "../src";

describe("withCustomRequest()", () => {
  it("awaits fresh authentication from a custom request hook for each call", async () => {
    const getToken = vi
      .fn()
      .mockResolvedValueOnce("first-token")
      .mockResolvedValueOnce("second-token");
    const fetch = vi
      .fn<typeof globalThis.fetch>()
      .mockResolvedValueOnce(
        Response.json({ data: { user: { login: "first" } } }),
      )
      .mockResolvedValueOnce(
        Response.json({ data: { user: { login: "second" } } }),
      );
    const myGraphql = withCustomRequest(
      request.defaults({
        request: {
          fetch,
          async hook(send: typeof request, options: EndpointOptions) {
            options.headers = {
              ...options.headers,
              authorization: `token ${await getToken()}`,
            };
            return send(options);
          },
        },
      }),
    );
    const query = "query($login: String!) { user(login: $login) { login } }";

    await expect(myGraphql(query, { login: "first" })).resolves.toStrictEqual({
      user: { login: "first" },
    });
    await expect(myGraphql(query, { login: "second" })).resolves.toStrictEqual({
      user: { login: "second" },
    });

    expect(getToken).toHaveBeenCalledTimes(2);
    expect(fetch).toHaveBeenCalledTimes(2);
    for (const [index, login] of ["first", "second"].entries()) {
      expect(fetch).toHaveBeenNthCalledWith(
        index + 1,
        "https://api.github.com/graphql",
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({
            authorization: `token ${login}-token`,
          }),
          body: JSON.stringify({ query, variables: { login } }),
        }),
      );
    }
  });

  it("propagates authentication hook failures without sending a request", async () => {
    const error = new Error("Token lookup failed");
    const getToken = vi.fn().mockRejectedValue(error);
    const fetch = vi
      .fn<typeof globalThis.fetch>()
      .mockResolvedValue(
        Response.json({ data: { viewer: { login: "unexpected" } } }),
      );
    const myGraphql = withCustomRequest(
      request.defaults({
        request: {
          fetch,
          async hook(send: typeof request, options: EndpointOptions) {
            options.headers = {
              ...options.headers,
              authorization: `token ${await getToken()}`,
            };
            return send(options);
          },
        },
      }),
    );

    await expect(myGraphql("{ viewer { login } }")).rejects.toBe(error);
    expect(getToken).toHaveBeenCalledTimes(1);
    expect(fetch).not.toHaveBeenCalled();
  });

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
