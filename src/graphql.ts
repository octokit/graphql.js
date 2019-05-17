import { request as Request } from '@octokit/request'
import { Endpoint } from '@octokit/request/dist-types/types';
import GraphqlError from './error'
import { GraphQlQueryResponse } from './types'

const NON_VARIABLE_OPTIONS = ['method', 'baseUrl', 'url', 'headers', 'request', 'query']

export default function graphql (request, query, options) {
  options = typeof query === 'string'
    ? options = Object.assign({ query }, options)
    : options = query

  const requestOptions = Object.keys(options).reduce((result, key) => {
    if (NON_VARIABLE_OPTIONS.includes(key)) {
      result[key] = options![key]
      return result
    }

    if (!result.variables) {
      result.variables = {}
    }

    result.variables[key] = options![key]
    return result
  }, {})

  return request(requestOptions)
    .then(response => {
      if (response.data.errors) {
        throw new GraphqlError(requestOptions, response)
      }

      return response.data.data
    })
}
