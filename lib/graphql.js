module.exports = graphql

const GraphqlError = require('./error')

const NON_VARIABLE_OPTIONS = ['method', 'baseUrl', 'url', 'headers', 'request', 'query']

function graphql (request, query, options) {
  const requestOptions = {
    variables: {}
  }

  if (typeof query === 'string') {
    options = Object.assign({ query }, options)
  } else {
    options = query
  }

  Object.keys(options).forEach(key => {
    if (NON_VARIABLE_OPTIONS.includes(key)) {
      requestOptions[key] = options[key]
      return
    }

    requestOptions.variables[key] = options[key]
  })

  return request(requestOptions)
    .then(response => {
      if (response.data.data) {
        return response.data
      }

      throw new GraphqlError(requestOptions, response)
    })
}
