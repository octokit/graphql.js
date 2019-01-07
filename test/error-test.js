const chai = require('chai')
const fetchMock = require('fetch-mock/es5/server')

const graphql = require('..')
const mockable = require('@octokit/request/lib/fetch')

const expect = chai.expect
const originalFetch = mockable.fetch

describe('errors', () => {
  afterEach(() => {
    mockable.fetch = originalFetch
  })

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
    mockable.fetch = fetchMock.sandbox()
      .post('https://api.github.com/graphql', mockResponse)

    return graphql(query, {
      headers: {
        authorization: `token secret123`
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
})
