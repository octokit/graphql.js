import { once } from "node:events";
import { createServer } from "node:http";
import { describe, expect, it } from "vitest";

import { graphql } from "../src";

describe("request cancellation", () => {
  it.each(["per-call", "defaults", "override"])(
    "uses the %s signal when cancelling after response headers",
    async (source) => {
      const server = createServer((_request, response) => {
        response.writeHead(200, { "content-type": "application/json" });
        response.write('{"data":{"viewer":');
      });
      const controller = new AbortController();
      const defaultSignal =
        source === "override" ? AbortSignal.abort() : controller.signal;

      try {
        server.listen(0, "127.0.0.1");
        await once(server, "listening");
        const address = server.address();
        if (!address || typeof address === "string") {
          throw new Error("Expected a TCP server address");
        }
        const client = graphql.defaults({
          baseUrl: `http://127.0.0.1:${address.port}`,
          request: {
            ...(source !== "per-call" ? { signal: defaultSignal } : {}),
            fetch: async (...args: Parameters<typeof fetch>) => {
              const response = await fetch(...args);
              controller.abort();
              return response;
            },
          },
        });

        const result = await client("{ viewer { login } }", {
          ...(source !== "defaults"
            ? { request: { signal: controller.signal } }
            : {}),
        }).catch((error: unknown) => error);

        expect(controller.signal.aborted).toBe(true);
        expect(result).toBe(controller.signal.reason);
      } finally {
        controller.abort();
        server.closeAllConnections();
        await new Promise<void>((resolve, reject) => {
          server.close((error) => (error ? reject(error) : resolve()));
        });
      }
    },
  );
});
