import dayjs from "dayjs";

export function generateRangeFromStartOfYear(){
  const firstDayOfYear = dayjs().startOf('year');
  
  const dates = []
  const today = new Date()

  let compareDate = firstDayOfYear

  while(compareDate.isBefore(today)){
    dates.push(compareDate.toDate())
    compareDate = compareDate.add(1, 'day')
  }

  return dates
}