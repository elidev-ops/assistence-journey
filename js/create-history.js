import { getCacheRepository } from './db.js'

const historyRepo = getCacheRepository('history')
const clientRepo = getCacheRepository('clients')
const deviceRepo = getCacheRepository('devices')

const now = new Date()

export function updateHistory () {
  const clients = clientRepo.find(filterToDate)
  const devices = deviceRepo.find(filterToDate, { params: { status: 1 } })
  const lastMonth = deviceRepo.find(filterToLastDate, { params: { status: 1 } })
  const clientsLastMonth = clientRepo.find(filterToLastDate)
  const income = devices.reduce(sumAmount, 0)
  const lastIncome = lastMonth.reduce(sumAmount, 0)
  const employeeAmount = Object.entries(devices.reduce((acc, { employee, amount }) => ({
    ...acc,
    [employee.username]: (acc[employee.username] || 0) + +amount })
  ,{}))
  const topEmployer = employeeAmount.reduce((prev, current) => 
    prev[1] > current[1] ? prev : current)
  
  const { id, ...currentHistory } = historyRepo.findOne(history => {
    const date = new Date(history.createdAt)
    if (date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear())
      return history
  }) || {}
 
  const currentHistoryData = {
    date: null,
    lastClients: clientsLastMonth.length,
    lastDevices: lastMonth.length,
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

  // const lastDevicesData = deviceRepo.find(d => {
  //   const device = new Date(d.updatedAt).getTime()
  //   const initial = new Date(2021, 10, 1).getTime()
  //   const end = new Date(2021, 11, 0).getTime()
  //   if (device > initial && device < end) return d
  // })

  // const lastClientsData = clientRepo.find(d => {
  //   const client = new Date(d.updatedAt).getTime()
  //   const initial = new Date(2021, 10, 1).getTime()
  //   const end = new Date(2021, 11, 0).getTime()
  //   if (client > initial && client < end) return d
  // })

  // const lastHistoryData = {
  //   date: Intl.DateTimeFormat('pt-BR', { dateStyle: 'short' }).format(new Date(2021, 11, 1)),
  //   lastClients: 0,
  //   lastDevices: 0,
  //   mediaIncome: 0,
  //   incomeDifference: {
  //     value: 0,
  //     date: new Date(2021, 11, 0)
  //   },
  //   income: lastDevicesData.reduce(sumAmount, 0),
  //   clients: lastClientsData,
  //   devices: lastDevicesData,
  //   topEmployer: Object.entries(lastDevicesData.reduce((acc, { employee, amount }) => ({
  //     ...acc,
  //     [employee.username]: (acc[employee.username] || 0) + +amount })
  //   ,{})).reduce((prev, current) => 
  //   prev[1] > current[1] ? prev : current),
  //   createdAt: new Date(2021, 10, 1),
  //   updatedAt: new Date(2021, 11, 1)
  // }

  // historyRepo.insert(lastHistoryData)

  if (!verifyObject(currentHistory)) {
    currentHistoryData.createdAt = new Date()
    historyRepo.insert(currentHistoryData)
  }
  
  historyRepo.updateOne({ id }, currentHistoryData)
}

function filterToDate (arr) {
  if (compareDate(arr.updatedAt)) return arr 
}

function filterToLastDate (arr) {
  if (compareDate(arr.updatedAt, { last: true })) return arr
}

function verifyObject (obj) {
  for (const prop in obj) return obj.hasOwnProperty(prop)
}

function createDate (date) {
  return isDate(date) ? date : new Date(date)
}

function isDate (date) {
  return date instanceof Date
}

function compareDate (date, { last } = false) {
  const objDate = createDate(date)
  const dateNow = createDate(new Date(
    new Date().getFullYear(), new Date().getMonth(), last ? 0 : 1))
  return last ? objDate.getTime() <= dateNow.getTime() : objDate.getTime() >= dateNow.getTime()
}

function sumAmount (acc, cur) {
  return acc += +cur.amount
}

updateHistory.close = () => {
  const historyOpen = historyRepo.findOne(history => {
    const historyDate = createDate(history.createdAt)
    const nowDate = createDate(new Date(now.getFullYear(), now.getMonth(), 0))
    if (historyDate.getTime() < nowDate.getTime()) {
      return history 
    }
  }, { params: { date: null } })

  if (historyOpen) {
    historyOpen.date = Intl.DateTimeFormat('pt-BR', { dateStyle: 'short' })
      .format(new Date(now.getFullYear(), now.getMonth() + 1, 0))
    historyOpen.updatedAt = new Date()
    historyRepo.updateOne({ id: historyOpen.id }, historyOpen)
  }
}

updateHistory.close()
updateHistory()