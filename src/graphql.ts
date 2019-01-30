import { Request } from '@octokit/request'
import { GraphQlQueryResponse } from '.'
import { GraphqlError } from './error'

const NON_VARIABLE_OPTIONS = ['method', 'baseUrl', 'url', 'headers', 'request', 'query']

function graphql (request: Request, query: string, options?: any) {
  options = typeof query === 'string'
    ? options = Object.assign({ query }, options)
    : options = query

  const requestOptions = Object.keys(options).reduce((result: any, key: string) => {
    if (NON_VARIABLE_OPTIONS.includes(key)) {
      result[key] = options[key]
      return result
    }

    if (!result.variables) {
      result.variables = {}
    }

    result.variables[key] = options[key]
    return result
  }, {})

  return request(requestOptions)
    .then((response: GraphQlQueryResponse) => {
      if (response.data && response.data.data) {
        return response.data.data
      }

      throw new GraphqlError(requestOptions, response)
    })
}

export = graphql
