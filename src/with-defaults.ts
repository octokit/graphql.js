import { Request } from '@octokit/request'
import graphql from './graphql'

function withDefaults (request: Request, newDefaults: any) {
  const newRequest = request.defaults(newDefaults)
  const newApi = (query: string, options: any) => graphql(newRequest, query, options)

  newApi.defaults = withDefaults.bind(null, newRequest)
  return newApi
}

export = withDefaults
