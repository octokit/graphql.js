import fetchMock from 'fetch-mock'

import graphql from '../src'

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
          locations: [
            {
              column: 5,
              line: 3
            }
          ],
          message: 'Field \'bioHtml\' doesn\'t exist on type \'User\''
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
        expect(error.message).toEqual('Field \'bioHtml\' doesn\'t exist on type \'User\'')
        expect(error.errors).toStrictEqual(mockResponse.errors)
        expect(error.request.query).toEqual(query)
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
          locations: [
            {
              column: 11,
              line: 7
            }
          ],
          message: '`invalid cursor` does not appear to be a valid cursor.',
          path: ['repository', 'ref', 'target', 'history'],
          type: 'INVALID_CURSOR_ARGUMENTS'
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
        expect(error.message).toEqual('`invalid cursor` does not appear to be a valid cursor.')
        expect(error.errors).toStrictEqual(mockResponse.errors)
        expect(error.request.query).toEqual(query)
        expect(error.data).toStrictEqual(mockResponse.data)
      })
  })
})
