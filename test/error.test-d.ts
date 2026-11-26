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
