// Back-end API RESTful
//

// localhost:3333/habits
// localhost:3333/

import Fastify from 'fastify'
import cors from '@fastify/cors'
import { appRoutes } from './routes'

const app = Fastify()

app.register(cors)
app.register(appRoutes)


app.listen({
  host: '10.0.0.80',
  port: 3003,
}).then((address)=> {
  console.log(`server listening on ${address}`)
})

// CORS: segurança para permitir acesso do front ao back
// npm i @fastify/cors