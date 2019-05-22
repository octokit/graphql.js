import { request as Request } from '@octokit/request'
import { Endpoint, Parameters, request as IRequest } from '@octokit/request/dist-types/types'
import { graphql } from './graphql'
import { GraphQlQueryResponse } from './types'

export function withDefaults (request: IRequest, newDefaults: Parameters): IRequest {
  const newRequest = request.defaults(newDefaults)
  const newApi = function <T extends GraphQlQueryResponse>(query: string | Endpoint, options?: Parameters) {
    return graphql<T>(newRequest, query, options)
  }

  return Object.assign(newApi, {
    defaults: withDefaults.bind(null, newRequest),
    endpoint: Request.endpoint
  })
}
