# graphql.js

> GitHub GraphQL API client for browsers and Node

[![@latest](https://img.shields.io/npm/v/@octokit/graphql.svg)](https://www.npmjs.com/package/@octokit/graphql)
[![Build Status](https://travis-ci.org/octokit/graphql.js.svg?branch=master)](https://travis-ci.org/octokit/graphql.js)
[![Coverage Status](https://coveralls.io/repos/github/octokit/graphql.js/badge.svg)](https://coveralls.io/github/octokit/graphql.js)
[![Greenkeeper](https://badges.greenkeeper.io/octokit/graphql.js.svg)](https://greenkeeper.io/)

## Usage

Send a simple query

```js
const graphql = require('@octokit/graphql')
const { data } = await graphql(`{
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

Send a query with variables

```js
const graphql = require('@octokit/graphql')
const { data } = await graphql(`query lastIssues($owner: String!, $repo: String!, $num: Int = 3) {
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
const { data } = await graphql(`{
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
const { data } = await graphql({
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
const { data } = await graphql(`{
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

## License

[MIT](LICENSE)
