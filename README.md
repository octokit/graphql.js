# 🚧 THIS IS [WORK IN PROGRESS](https://github.com/octokit/graphql.js)

# graphql.js

> GitHub GraphQL API client for browsers and Node

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

## License

[MIT](LICENSE)
