import { HabitDay } from './HabitDay';
import { generateRangeFromStartOfYear } from '../utils/generate-range-from-start-of-year';
import { useEffect, useState } from 'react';
import { api } from '../lib/axios';
import dayjs from 'dayjs';

const weekdays = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S']

const summaryDates = generateRangeFromStartOfYear()

const minimumSummaryDates = 18 * 7 // 18 weeks
const amountOfDaysToFill = minimumSummaryDates - summaryDates.length

type Summary = {
  id: string;
  date: string;
  amount: number;
  completed: number;
}[]

export function SummaryTable() {
  const [summary, setSummary] = useState<Summary>([])

  useEffect(() => {
    api.get('/summary').then(response => {
      setSummary(response.data)
      console.log(response.data)
    })
  }, [])

  return (
    <div className='flex w-full'>
      <div className='grid grid-rows-7 grid-flow-row gap-3'>
        {weekdays.map((weekday, i) => {
          return(
            <div 
              key={`${weekday}-${i}`}
              className='text-zinc-400 text-xl h-10 w-10 font-bold flex items-center justify-center'
            >
              {weekday}
            </div>
          )
        })
        }
      </div>
      <div className='grid grid-rows-7 grid-flow-col gap-3'>
        {summaryDates.map(date => {
          const dayInSummary = summary.find(day => {
            return dayjs(date).isSame(day.date, 'day')
          })

          return (
            <HabitDay 
              key={date.toString()} 
              date={date}
              amount={dayInSummary?.amount} 
              completed={dayInSummary?.completed} 
            />
          )
        })}

        {amountOfDaysToFill > 0 && Array.from({ length: amountOfDaysToFill}).map((_, i) => {
          return (
            <div 
              key={i} 
              className="bg-zinc-900 w-10 h-10 border-2 border-zinc-800 rounded-lg opacity-40 cursor-not-allowed"
            />
          )
        })}

      </div>
    </div>
  )
}