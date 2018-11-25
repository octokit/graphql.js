const chai = require('chai')
const fetchMock = require('fetch-mock/es5/server')

const graphql = require('..')
const mockable = require('@octokit/request/lib/fetch')

const expect = chai.expect

describe('graphql.defaults()', () => {
  it('is a function', () => {
    expect(graphql.defaults).to.be.a('function')
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

    mockable.fetch = fetchMock.sandbox()
      .post('https://api.github.com/graphql', { data: mockData }, {
        headers: {
          authorization: 'token secret123'
        }
      })

    const authenticatedGraphql = graphql.defaults({
      headers: {
        authorization: `token secret123`
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
      .then(response => {
        expect(response.data).to.deep.equal(mockData)
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

    mockable.fetch = fetchMock.sandbox()
      .post('https://github.acme-inc.com/api/graphql', { data: mockData }, {
        headers: {
          authorization: 'token secret123'
        }
      })

    const authenticatedGraphql = graphql.defaults({
      headers: {
        authorization: `token secret123`
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
      .then(response => {
        expect(response.data).to.deep.equal(mockData)
      })
  })
})
