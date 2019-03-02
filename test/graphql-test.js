const chai = require('chai')
const getUserAgent = require('universal-user-agent')
const fetchMock = require('fetch-mock/es5/server')

const graphql = require('..')

const expect = chai.expect

const pkg = require('../package.json')
const userAgent = `octokit-graphql.js/${pkg.version} ${getUserAgent()}`

describe('graphql()', () => {
  it('is a function', () => {
    expect(graphql).to.be.a('function')
  })

  it('README simple query example', () => {
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

    return graphql(`{
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
      },
      request: {
        fetch: fetchMock.sandbox()
          .post('https://api.github.com/graphql', { data: mockData }, {
            headers: {
              accept: 'application/vnd.github.v3+json',
              authorization: 'token secret123',
              'user-agent': userAgent
            }
          })
      }
    })

      .then(result => {
        expect(result).to.deep.equal(mockData)
      })
  })

  it('Variables', () => {
    const query = `query lastIssues($owner: String!, $repo: String!, $num: Int = 3) {
      repository(owner:$owner, name:$repo) {
        issues(last:$num) {
          edges {
            node {
              title
            }
          }
        }
      }
    }`

    return graphql(query, {
      headers: {
        authorization: `token secret123`
      },
      owner: 'octokit',
      repo: 'graphql.js',
      request: {
        fetch: fetchMock.sandbox()
          .post('https://api.github.com/graphql', (url, options) => {
            const body = JSON.parse(options.body)
            expect(body.query).to.equal(query)
            expect(body.variables).to.deep.equal({
              owner: 'octokit',
              repo: 'graphql.js'
            })

            return { data: {} }
          })
      }
    })
  })

  it('Pass query together with headers and variables', () => {
    const query = `query lastIssues($owner: String!, $repo: String!, $num: Int = 3) {
      repository(owner:$owner, name:$repo) {
        issues(last:$num) {
          edges {
            node {
              title
            }
          }
        }
      }
    }`

    return graphql({
      query,
      headers: {
        authorization: `token secret123`
      },
      owner: 'octokit',
      repo: 'graphql.js',
      request: {
        fetch: fetchMock.sandbox()
          .post('https://api.github.com/graphql', (url, options) => {
            const body = JSON.parse(options.body)
            expect(body.query).to.equal(query)
            expect(body.variables).to.deep.equal({
              owner: 'octokit',
              repo: 'graphql.js'
            })

            return { data: {} }
          })
      }
    })
  })

  it('Don’t send empty variables object', () => {
    const query = '{ viewer { login } }'

    return graphql(query, {
      headers: {
        authorization: `token secret123`
      },
      request: {
        fetch: fetchMock.sandbox()
          .post('https://api.github.com/graphql', (url, options) => {
            const body = JSON.parse(options.body)
            expect(body.query).to.equal(query)
            expect(body.variables).to.equal(undefined)

            return { data: {} }
          })
      }
    })
  })
})
