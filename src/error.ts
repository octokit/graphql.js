import { OctokitResponse, request as Request, AnyResponse } from '@octokit/request/dist-types/types'
import { GraphQlQueryResponse } from './types'

export default class GraphqlError extends Error {
  public request: Request
  constructor (request: Request, response: AnyResponse) {
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
