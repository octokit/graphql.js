import { assertType, describe, it } from "vitest";

import type { GraphqlResponseError } from "../src/index.js";

type ErrorPath = NonNullable<
  GraphqlResponseError<unknown>["errors"]
>[number]["path"];

describe("GraphQL error paths", () => {
  it("accepts a single field name", () => {
    assertType<ErrorPath>(["viewer"]);
  });

  it("accepts nested field names", () => {
    assertType<ErrorPath>(["repository", "ref", "target", "history"]);
  });

  it("accepts list indices between field names", () => {
    assertType<ErrorPath>(["repository", "issues", "nodes", 0, "title"]);
  });

  it("rejects segments that are neither strings nor numbers", () => {
    // @ts-expect-error Boolean values are not response path segments.
    assertType<ErrorPath>(["viewer", true]);
    // @ts-expect-error Objects are not response path segments.
    assertType<ErrorPath>(["viewer", {}]);
  });
});

type ResponseErrors = NonNullable<GraphqlResponseError<unknown>["errors"]>;
type ResponseError = ResponseErrors[number];

describe("GraphQL response error lists", () => {
  const first: ResponseError = {
    type: "NOT_FOUND",
    message: "First field failed",
    path: ["repository"],
    extensions: {},
    locations: [{ line: 1, column: 1 }],
  };
  const second: ResponseError = {
    ...first,
    message: "Second field failed",
    path: ["viewer"],
  };

  it("accepts a single error and location", () => {
    assertType<ResponseErrors>([first]);
    assertType<ResponseError["locations"]>([{ line: 1, column: 1 }]);
  });

  it("accepts multiple errors", () => {
    assertType<ResponseErrors>([first, second]);
  });

  it("accepts multiple locations", () => {
    assertType<ResponseError["locations"]>([
      { line: 1, column: 1 },
      { line: 2, column: 1 },
    ]);
  });

  it("rejects empty error and location lists", () => {
    // @ts-expect-error An error list must contain at least one error.
    assertType<ResponseErrors>([]);
    // @ts-expect-error A location list must contain at least one location.
    assertType<ResponseError["locations"]>([]);
  });

  it("rejects invalid error and location entries", () => {
    // @ts-expect-error Errors must have the response error shape.
    assertType<ResponseErrors>(["error"]);
    // @ts-expect-error Location coordinates must be numbers.
    assertType<ResponseError["locations"]>([{ line: 1, column: "1" }]);
  });
});
