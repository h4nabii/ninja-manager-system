import dayjs from 'dayjs'

export function monthOrderNumOfDay(dayObj: any) {
  const day = dayjs(dayObj)
  const monthWeekStart = day.startOf('month').startOf('week')
  const index = day.date()
  let offset = 0
  if (monthWeekStart.month() !== day.month()) offset = 1
  return Math.floor(index / 7) + offset
}

export function getLastManyWeekends(num: number) {
  const weekends: Date[] = []
  let weekend = dayjs().day(6)
  for (let i = 0; i < num; i++) {
    weekends.push(weekend.toDate())
    weekend = weekend.subtract(1, 'week')
  }
  return weekends
}

export function getWeekendsOfMonth(year: number, month: number) {
  const weekends: Date[] = []
  const startOfMonth = dayjs(`${year}-${month}-01`)
  const endOfMonth = startOfMonth.add(1, 'month')
  let weekend = startOfMonth.day(6)
  while (weekend.isBefore(endOfMonth)) {
    weekends.push(weekend.toDate())
    weekend = weekend.add(1, 'week')
  }
  return weekends
}
