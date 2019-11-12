'use strict'

// IMPORTS
import http from 'http'
import path from 'path'
import express from 'express'
import favicon from 'serve-favicon'
import bodyParser from 'body-parser'
import ApiGit from './api'

// Server instance and settings
const app = express()
const setup = {
  path: 'public/',
  port: process.env.PORT || 3030,
  api: '/api/users/',
  repos: ':user/repos',
  details: ':user/details',
  headers: {
    type: 'application/json',
    origin: ['Access-Control-Allow-Origin', '*']
  },
  banner: '\nExpress server on\n',
  favicon: 'public/favicon.ico'
}

app.use(favicon(setup.favicon))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.static(path.join(setup.path)))
app.get(setup.api, async (request, response) => {
  let statusCode = request.query.since ? 200 : 400
  let api, data
  if (statusCode === 200) {
    api = new ApiGit(request.query.since)
    data = await api.getList()
    statusCode = api.status() ? 200 : 404
  }
  response
    .status(statusCode)
    .set(setup.headers.origin)
    .type(setup.headers.type)
    .json(data || { message: 'Bad request' })
    .end()
})

app.get(setup.api + setup.repos, async (request, response) => {
  const api = new ApiGit(request.params.user)
  const data = await api.apiRepos()
  const code = api.status() ? 200 : 404
  response
    .status(code)
    .set(setup.headers.origin)
    .type(setup.headers.type)
    .json(data)
    .end()
})

app.get(setup.api + setup.details, async (request, response) => {
  const api = new ApiGit(request.params.user)
  const data = await api.apiDetails()
  const code = api.status() ? 200 : 404
  response
    .status(code)
    .set(setup.headers.origin)
    .type(setup.headers.type)
    .json(data)
    .end()
})

app.get('/*', (request, response) => {
  const error = {
    status: 400,
    message: 'bad request'
  }
  response
    .status(error.status)
    .set(setup.headers.origin)
    .type(setup.headers.type)
    .json(error)
    .end()
})

// Start Serve
const server = http.createServer(app)
server.listen(setup.port, () => {
  console.log(setup.banner)
})
