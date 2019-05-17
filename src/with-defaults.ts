import { request as Request } from '@octokit/request'
import { Parameters } from '@octokit/request/dist-types/types' 
import graphql from './graphql'

export default function withDefaults (request: typeof Request, newDefaults: Parameters) {
  const newRequest = request.defaults(newDefaults)
  const newApi = function (query, options) {
    return graphql(newRequest, query, options)
  }

  newApi.defaults = withDefaults.bind(null, newRequest)
  return newApi
}
