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
  port: 3003,
}).then(()=> {
  console.log('HTTP Server running on http://localhost:3003')
})

// CORS: segurança para permitir acesso do front ao back
// npm i @fastify/cors