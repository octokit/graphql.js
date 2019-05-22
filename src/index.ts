import { request } from "@octokit/request";
import getUserAgent from "universal-user-agent";

import { VERSION } from "./version";
const userAgent = `octokit-graphql.js/${VERSION} ${getUserAgent()}`;

import { withDefaults } from "./with-defaults";

export const graphql = withDefaults(request, {
  headers: {
    "user-agent": userAgent
  },
  method: "POST",
  url: "/graphql"
});
