import { getCacheRepository } from './db.js'

const historyRepo = getCacheRepository('history')
const clientRepo = getCacheRepository('clients')
const deviceRepo = getCacheRepository('devices')

const now = new Date()

const lastHistory = historyRepo.find(h => h.date)
  .reduce((acc, cur) => acc = [...acc, ...cur.devices, ...cur.clients] ,[])
  .map(d => d.id)

export function updateHistory () {
  const clients = clientRepo.find(filterToDate)
  const devices = deviceRepo.find(filterToDate, { params: { status: 1 } })
  const clientsLastMonth = historyRepo.findOne(filterToLastDate)?.clients || []
  const devicesLastMonth = historyRepo.findOne(filterToLastDate)?.devices || []
  const income = devices.reduce(sumAmount, 0)
  const lastIncome = devicesLastMonth.reduce(sumAmount, 0)

  const employeeAmount = Object.entries(devices.reduce((acc, { employee, amount }) => ({
    ...acc,
    [employee.username]: (acc[employee.username] || 0) + +amount })
    ,{})) || ''
    const topEmployer = employeeAmount.reduce((prev, current) => 
    prev[1] > current[1] ? prev : current, [])
    
    const { id, ...currentHistory } = historyRepo.findOne(history => {
      const date = new Date(history.createdAt)
      if (date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear())
      return history
    }) || {}

  const currentHistoryData = {
    date: null,
    lastClients: clientsLastMonth.length || 0,
    lastDevices: devicesLastMonth.length || 0,
    mediaIncome: deviceRepo.find(filterToDate).reduce(sumAmount, 0),
    incomeDifference: {
      value: lastIncome,
      date: new Date()
    },
    income,
    clients,
    devices,
    topEmployer,
    updatedAt: new Date()
  }

  if (!verifyObject(currentHistory)) {
    currentHistoryData.createdAt = new Date()
    historyRepo.insert(currentHistoryData)
  }
  
  historyRepo.updateOne({ id }, currentHistoryData) // bug na atualização de dados quando caixa fechado
}

function filterToDate (arr) {
  if (compareDate(arr.updatedAt) && !lastHistory.includes(arr.id)) return arr 
}

function filterToLastDate (arr) {
  if (compareDate(arr.createdAt, { last: true })) return arr
}

function verifyObject (obj) {
  for (const prop in obj) return obj.hasOwnProperty(prop)
}

function createDate (date) {
  return isDate(date) ? date : new Date(date)
}

function createDateWithoutTimes (value) {
  const date = isDate(value) ? value : new Date(value)
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

function isDate (date) {
  return date instanceof Date
}

function compareDate (date, { last } = false) {
  const now = new Date()
  const objDate = createDateWithoutTimes(date)
  const dateNow = createDateWithoutTimes(new Date(
    new Date().getFullYear(), new Date().getMonth(), last ? 0 : 1))
  return last ? 
    objDate.getTime() > createDate(new Date(now.getFullYear(), now.getMonth() - 1, 0)).getTime() &&
    objDate.getTime() <= dateNow.getTime() : 
    objDate.getTime() >= dateNow.getTime()
}

function sumAmount (acc, cur) {
  return acc += +cur.amount
}

updateHistory.close = () => {
  const historyOpen = historyRepo.findOne(history => {
    const h = createDate(history.createdAt)
    const historyDate = new Date(h.getFullYear(), h.getMonth() + 1, 0)
    const nowDate = createDate(new Date())
    if (historyDate.getTime() < nowDate.getTime()) {
      return history 
    }
  }, { params: { date: null } })
  if (historyOpen) {
    historyOpen.date = Intl
      .DateTimeFormat('pt-BR', { dateStyle: 'short' })
      .format(new Date(now.getFullYear(), now.getMonth() + 1, 0))
    historyOpen.mediaIncome = 0
    historyOpen.updatedAt = new Date()
    historyRepo.updateOne({ id: historyOpen.id }, historyOpen)
  }
}

updateHistory.close()
updateHistory()
