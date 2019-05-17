import { Endpoint } from '@octokit/endpoint/dist-types/types';
import { AnyResponse } from '@octokit/request/dist-types/types'

export default class GraphqlError extends Error {
  public request: Endpoint
  constructor (request: Endpoint, response: AnyResponse) {
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
