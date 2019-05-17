import { request } from '@octokit/request'
import getUserAgent from 'universal-user-agent'

import { version } from '../package.json'
const userAgent = `octokit-graphql.js/${version} ${getUserAgent()}`

import withDefaults from './with-defaults'

export default withDefaults(request, {
  headers: {
    'user-agent': userAgent
  },
  method: 'POST',
  url: '/graphql'
})
