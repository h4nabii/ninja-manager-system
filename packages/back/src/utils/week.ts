import dayjs from 'dayjs'

export function getLastManyBattleWeeks(num: number) {
  const weekends: BattleWeek[] = []
  let weekend = dayjs().day(6)
  for (let i = 0; i < num; i++) {
    weekends.push(BattleWeek.fromSat(weekend))
    weekend = weekend.subtract(1, 'week')
  }
  return weekends
}

export class BattleItem {
  type: 'battle' | 'abyss'
  date: dayjs.Dayjs

  constructor(type: 'battle' | 'abyss', date: dayjs.Dayjs) {
    this.type = type
    this.date = date.startOf('day')
  }

  get dateStr() {
    return dayjs(this.date).format('YYYY-MM-DD')
  }

  get dateObj() {
    return this.date.toDate()
  }
}

export class BattleWeek {
  abyss: BattleItem
  saturday: BattleItem
  sunday: BattleItem

  constructor(options: { abyss: BattleItem; saturday: BattleItem; sunday: BattleItem }) {
    this.abyss = options.abyss
    this.saturday = options.saturday
    this.sunday = options.sunday
  }

  get year() {
    return this.saturday.date.year()
  }

  get month() {
    return this.saturday.date.month() + 1
  }

  get keyStr() {
    return `${this.year}-${this.month}(${this.orderNumInMonth})`
  }

  get orderNumInMonth() {
    const day = this.saturday.date
    const monthWeekStart = day.startOf('month').startOf('week')
    const index = day.date()
    let offset = 0
    if (monthWeekStart.month() !== day.month()) offset = 1
    return Math.floor(index / 7) + offset
  }

  static fromSat(satDate: dayjs.Dayjs) {
    const abyss = new BattleItem('abyss', satDate.subtract(1, 'd'))
    const saturday = new BattleItem('battle', satDate)
    const sunday = new BattleItem('battle', satDate.add(1, 'd'))
    return new BattleWeek({ abyss, saturday, sunday })
  }

  static fromKeyStr(keyStr: string) {
    const [yearStr, monthOrder] = keyStr.split('-')
    const [monthStr, orderStr] = monthOrder.split(/[()]/)
    console.log(yearStr, monthStr, orderStr)
    const startOfMonth = dayjs()
      .year(Number(yearStr))
      .month(Number(monthStr) - 1)
      .startOf('month')
    const weekend = startOfMonth.day(6).add((Number(orderStr) - 1) * 7, 'day')
    return BattleWeek.fromSat(weekend)
  }
}

export class BattleMonth {
  weeks: BattleWeek[]

  constructor(options: { weeks: BattleWeek[] }) {
    this.weeks = options.weeks
  }

  static fromYearMonth(year: number, month: number) {
    const weeks: BattleWeek[] = []
    const startOfMonth = dayjs()
      .year(year)
      .month(month - 1)
      .startOf('month')
    const endOfMonth = startOfMonth.add(1, 'month')
    let weekend = startOfMonth.day(6)
    while (weekend.isBefore(endOfMonth)) {
      weeks.push(BattleWeek.fromSat(weekend))
      weekend = weekend.add(1, 'week')
    }
    return new BattleMonth({ weeks })
  }
}
