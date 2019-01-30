import { RequestOptions } from '@octokit/request'
import { GraphQlQueryResponse } from '.'

export class GraphqlError extends Error {
  public request: RequestOptions

  constructor (request: RequestOptions, response: GraphQlQueryResponse) {
    const message = response.data ? response.data.errors[0].message : 'ERROR'
    super(message)

    Object.assign(this, response.data)
    this.name = 'GraphqlError'
    this.request = request

    // Maintains proper stack trace (only available on V8)
    /* istanbul ignore next */
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor)
    }
  }
}
