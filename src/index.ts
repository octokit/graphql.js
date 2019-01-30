import request from '@octokit/request'
import getUserAgent from 'universal-user-agent'

import version = require('./package.json').version
const userAgent = `octokit-graphql.js/${version} ${getUserAgent()}`

import withDefaults from './with-defaults'

export interface GraphQlQueryResponse {
  data: { [ key: string ]: any } | null
  errors?: [{
    message: string
    path: [string]
    extensions: { [ key: string ]: any }
    locations: [{
      line: number,
      column: number
    }]
  }]
}

export default withDefaults(request, {
  headers: { 'user-agent': userAgent },
  method: 'POST',
  url: '/graphql'
})
