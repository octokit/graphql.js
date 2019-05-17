import { request } from '@octokit/request'
import getUserAgent from 'universal-user-agent'

import { version } from './package.json'
const userAgent = `octokit-graphql.js/${version} ${getUserAgent()}`

import withDefaults from './lib/with-defaults'

export default withDefaults(request, {
  method: 'POST',
  url: '/graphql',
  headers: {
    'user-agent': userAgent
  }
})
