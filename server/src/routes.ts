import dayjs from "dayjs";
import { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "./lib/prisma";

export async function appRoutes(app: FastifyInstance) {
  app.post("/habits", async (request) => {
    // Validação (garantir que usuário enviou as coisas certas)
    const createHabitBody = z.object({
      title: z.string(), // .nullable() para um parametro não obrigatorio
      weekDays: z.array(
        z.number().min(0).max(6) // [0, 1, 2, 3, 4, 5, 6] => Domingo, Segunda, Terça...
      ), 
    });

    const { title, weekDays } = createHabitBody.parse(request.body);
    // validar a body

    const today = dayjs().startOf('day').toDate();
 

    await prisma.habit.create({
      data: {
        title,
        created_at: today,
        weekDays: {
          create: weekDays.map((weekDay) => {
            // for each weekDay in weekDays array, return ...
            return {
              week_day: weekDay,
            };
          }),
        },
      },
    });
  });

  app.get('/day', async (request) => {
    const getDayParams = z.object({
      date: z.coerce.date() // Will transform to date if needed (coerce)
      // isso porque o front-end envia uma string e não um obj Date
    })

    const { date } = getDayParams.parse(request.query)

    const parsedDate = dayjs(date).startOf('day')
    const weekDay = parsedDate.get('day')

    // todos hábitos possíveis
    // hábitos que já foram completados

    const possibleHabits = await prisma.habit.findMany({
      where: {
        created_at: {
          lte: date, // data menor ou igual (lte)
        },
        weekDays: { // hábito precisa estar disponível em tal dia da semana
          some: {  //every, none, some -- some: achar week_days que preenchem pelo menos algum requisito
            week_day: weekDay
          }
        }
      }
    })

    const day = await prisma.day.findFirst({
      where: {
        date: parsedDate.toDate(),
      },
      include: {
        dayHabits: true, // mostrar os DayHabits, ou seja, os hábitos completados
      }
    })

    // ?. -> caso day não seja nulo, fazer map de dayHabits retornando o id para cada dayHabit
    const completedHabits = day?.dayHabits.map(dayHabit => { 
      return dayHabit.habit_id
    }) ?? []

    return {
      possibleHabits,
      completedHabits,
    }
  })

  app.get("/beber", async () => {
    const habits = await prisma.habit.findMany({
      where: {
        title: {
          startsWith: "Beber",
        },
      },
    });
    return habits;
  });

  app.patch('/habits/:id/toggle', async (request) => {
    // :id is route param - identification parameter

    const toggleHabitParams = z.object({
      id: z.string().uuid(),
    })

    const { id } = toggleHabitParams.parse(request.params)

    const today = dayjs().startOf('day').toDate()

    let day = await prisma.day.findUnique({
      where: {
        date: today,
      }
    })

    // If day doesn't exist in DB, create new day with current date (today)
    if (!day) {
      day = await prisma.day.create({
        data: {
          date: today,
        }
      })
    }

    const dayHabit = await prisma.dayHabit.findUnique({
      where: {
        day_id_habit_id: {
          day_id: day.id,
          habit_id: id,
        }
      }
    })

    if (dayHabit) {
      // Remove habit as completed
      await prisma.dayHabit.delete({
        where: {
          id: dayHabit.id
        }
      })
    } else {
      // Complete habit
      await prisma.dayHabit.create({
        data: {
          day_id: day.id,
          habit_id: id,
        }
      })
    }




  });

  app.get('/summary', async () => {
    // [ { date: 05/05, amount: 5, completed: 1 }, { date: 06/05, amount: 3, completed: 2 }, {} ]
    // ORM, Query Builder (prisma)
    // More complex query with more conditions and relationships => Raw SQL (SQLite)
  
    const summary = await prisma.$queryRaw`
      SELECT 
        D.id, 
        D.date,
        (
          SELECT 
            cast(count(*) as float)
          FROM day_habits DH
          WHERE DH.day_id = D.id
        ) as completed,
        (
          SELECT
            cast(count(*) as float)
          FROM habit_week_days HWD
          JOIN habits H
            ON H.id = HWD.habit_id
          WHERE
            HWD.week_day = cast(strftime('%w', D.date/1000.0, 'unixepoch') as int)
            AND H.created_at <= D.date
        ) as amount
      FROM days D
    `

    // Epoch Timestamp => SQLite

    return summary
  });
}
