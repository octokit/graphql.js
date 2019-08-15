import fetchMock from 'fetch-mock'

import graphql from '../src'

describe('graphql.defaults()', () => {
  it('is a function', () => {
    expect(graphql.defaults).toBeInstanceOf(Function)
  })

  it('README example', () => {
    const mockData = {
      repository: {
        issues: {
          edges: [
            {
              node: {
                title: 'Foo'
              }
            },
            {
              node: {
                title: 'Bar'
              }
            },
            {
              node: {
                title: 'Baz'
              }
            }
          ]
        }
      }
    }

    const authenticatedGraphql = graphql.defaults({
      headers: {
        authorization: `token secret123`
      },
      request: {
        fetch: fetchMock.sandbox()
          .post('https://api.github.com/graphql', { data: mockData }, {
            headers: {
              authorization: 'token secret123'
            }
          })
      }
    })
    return authenticatedGraphql(`{
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
      .then(result => {
        expect(result).toStrictEqual(mockData)
      })
  })

  it('repeated defaults', () => {
    const mockData = {
      repository: {
        issues: {
          edges: [
            {
              node: {
                title: 'Foo'
              }
            },
            {
              node: {
                title: 'Bar'
              }
            },
            {
              node: {
                title: 'Baz'
              }
            }
          ]
        }
      }
    }

    const authenticatedGraphql = graphql.defaults({
      headers: {
        authorization: `token secret123`
      },
      request: {
        fetch: fetchMock.sandbox()
          .post('https://github.acme-inc.com/api/graphql', { data: mockData }, {
            headers: {
              authorization: 'token secret123'
            }
          })
      }
    })
    const acmeGraphql = authenticatedGraphql.defaults({
      baseUrl: 'https://github.acme-inc.com/api'
    })
    return acmeGraphql(`{
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
      .then(result => {
        expect(result).toStrictEqual(mockData)
      })
  })
})
