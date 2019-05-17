import { RequestOptions } from '@octokit/request/dist-types/types'

export default class GraphqlError extends Error {
  constructor (request: RequestOptions, response) {
    const message = response.data.errors[0].message
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
