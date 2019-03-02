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
})
