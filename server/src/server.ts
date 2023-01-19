// Back-end API RESTful
//

// localhost:3333/habits
// localhost:3333/

import Fastify from 'fastify'
import cors from '@fastify/cors'
import { PrismaClient } from '@prisma/client'

const app = Fastify()
const prisma = new PrismaClient()

app.register(cors)

app.get('/', async () => {
  const habits = await prisma.habit.findMany(
    // {
    //   where: {
    //     title: {
    //       startsWith: 'Beber'
    //     }
    //   }
    // }
  )

  return habits
})

app.listen({
  port: 3003,
}).then(()=> {
  console.log('HTTP Server running!')
})

// CORS: segurança para permitir acesso do front ao back
// npm i @fastify/cors