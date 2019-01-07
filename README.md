# graphql.js

> GitHub GraphQL API client for browsers and Node

[![@latest](https://img.shields.io/npm/v/@octokit/graphql.svg)](https://www.npmjs.com/package/@octokit/graphql)
[![Build Status](https://travis-ci.com/octokit/graphql.js.svg?branch=master)](https://travis-ci.com/octokit/graphql.js)
[![Coverage Status](https://coveralls.io/repos/github/octokit/graphql.js/badge.svg)](https://coveralls.io/github/octokit/graphql.js)
[![Greenkeeper](https://badges.greenkeeper.io/octokit/graphql.js.svg)](https://greenkeeper.io/)

## Usage

Send a simple query

```js
const graphql = require('@octokit/graphql')
const { repository } = await graphql(`{
  repository(owner:"octokit", name:"graphql.js") {
    issues(last:3) {
      edges {
        node {
          title
        }
      }
    }
  }
}`, {
  headers: {
    authorization: `token secret123`
  }
})
```

⚠️ Do not use [template literals](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals) in the query strings as they make your code vulnerable to query injection attacks (see [#2](https://github.com/octokit/graphql.js/issues/2)). Use variables instead:

```js
const graphql = require('@octokit/graphql')
const { lastIssues } = await graphql(`query lastIssues($owner: String!, $repo: String!, $num: Int = 3) {
    repository(owner:$owner, name:$repo) {
      issues(last:$num) {
        edges {
          node {
            title
          }
        }
      }
    }
  }`, {
    owner: 'octokit',
    repo: 'graphql.js'
    headers: {
      authorization: `token secret123`
    }
  }
})
```

Set default options

```js
const graphql = require('@octokit/graphql').defaults({
  headers: {
    authorization: `token secret123`
  }
})
const { repository } = await graphql(`{
  repository(owner:"octokit", name:"graphql.js") {
    issues(last:3) {
      edges {
        node {
          title
        }
      }
    }
  }
}`)
```

Pass query together with headers and variables

```js
const graphql = require('@octokit/graphql')
const { lastIssues } = await graphql({
  query: `query lastIssues($owner: String!, $repo: String!, $num: Int = 3) {
    repository(owner:$owner, name:$repo) {
      issues(last:$num) {
        edges {
          node {
            title
          }
        }
      }
    }
  }`,
  owner: 'octokit',
  repo: 'graphql.js'
  headers: {
    authorization: `token secret123`
  }
})
```

Use with GitHub Enterprise

```js
const graphql = require('@octokit/graphql').defaults({
  baseUrl: 'https://github-enterprise.acme-inc.com/api',
  headers: {
    authorization: `token secret123`
  }
})
const { repository } = await graphql(`{
  repository(owner:"acme-project", name:"acme-repo") {
    issues(last:3) {
      edges {
        node {
          title
        }
      }
    }
  }
}`)
```

## Errors

In case of a GraphQL error, `error.message` is set to the first error from the response’s `errors` array. All errors can be accessed at `error.errors`. `error.request` has the request options such as query, variables and headers set for easier debugging.

```js
const graphql = require('@octokit/graphql').defaults({
  headers: {
    authorization: `token secret123`
  }
})
const query = `{
  viewer {
    bioHtml
  }
}`

try {
  const result = await graphql(query)
} catch (error) {
  // server responds with
  // {
  // 	"data": null,
  // 	"errors": [{
  // 		"message": "Field 'bioHtml' doesn't exist on type 'User'",
  // 		"locations": [{
  // 			"line": 3,
  // 			"column": 5
  // 		}]
  // 	}]
  // }

  console.log('Request failed:', error.request) // { query, variables: {}, headers: { authorization: 'token secret123' } }
  console.log(error.message) // Field 'bioHtml' doesn't exist on type 'User'
}
```

## License

[MIT](LICENSE)
