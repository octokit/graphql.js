const chai = require('chai')
const fetchMock = require('fetch-mock/es5/server')

const graphql = require('..')

const expect = chai.expect

describe('errors', () => {
  it('Invalid query', () => {
    const query = `{
  viewer {
    bioHtml
  }
}`
    const mockResponse = {
      data: null,
      errors: [
        {
          message: 'Field \'bioHtml\' doesn\'t exist on type \'User\'',
          locations: [
            {
              line: 3,
              column: 5
            }
          ]
        }
      ]
    }

    return graphql(query, {
      headers: {
        authorization: `token secret123`
      },
      request: {
        fetch: fetchMock.sandbox()
          .post('https://api.github.com/graphql', mockResponse)
      }
    })

      .then(result => {
        throw new Error('Should not resolve')
      })

      .catch(error => {
        expect(error.message).to.equal('Field \'bioHtml\' doesn\'t exist on type \'User\'')
        expect(error.errors).to.deep.equal(mockResponse.errors)
        expect(error.request.query).to.equal(query)
      })
  })

  it('Should throw an error for a partial response accompanied by errors', () => {
    const query = `{
      repository(name: "probot", owner: "probot") {
        name
        ref(qualifiedName: "master") {
          target {
            ... on Commit {
              history(first: 25, after: "invalid cursor") {
                nodes {
                  message
                }
              }
            }
          }
        }
      }
    }`

    const mockResponse = {
      data: {
        repository: {
          name: 'probot',
          ref: null
        }
      },
      errors: [
        {
          type: 'INVALID_CURSOR_ARGUMENTS',
          path: ['repository', 'ref', 'target', 'history'],
          locations: [
            {
              line: 7,
              column: 11
            }
          ],
          message: '`invalid cursor` does not appear to be a valid cursor.'
        }
      ]
    }

    return graphql(query, {
      headers: {
        authorization: `token secret123`
      },
      request: {
        fetch: fetchMock.sandbox()
          .post('https://api.github.com/graphql', mockResponse)
      }
    })

      .then(result => {
        throw new Error('Should not resolve')
      }).catch(error => {
        expect(error.message).to.equal('`invalid cursor` does not appear to be a valid cursor.')
        expect(error.errors).to.deep.equal(mockResponse.errors)
        expect(error.request.query).to.equal(query)
        expect(error.data).to.deep.equal(mockResponse.data)
      })
  })
})
