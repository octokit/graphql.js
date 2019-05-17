import { request as Request } from '@octokit/request'
import { Endpoint, Parameters, request as IRequest } from '@octokit/request/dist-types/types' 
import graphql from './graphql'

export default function withDefaults (request: IRequest, newDefaults: Parameters): IRequest {
  const newRequest = request.defaults(newDefaults)
  const newApi = function (query: string | Endpoint, options?: Parameters) {
    return graphql(newRequest, query, options)
  }

  return Object.assign(newApi, {
    defaults: withDefaults.bind(null, newRequest),
    endpoint: Request.endpoint
  })
}
