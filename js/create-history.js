import { getCacheRepository } from './db.js'

const historyRepo = getCacheRepository('history')
const clientRepo = getCacheRepository('clients')
const deviceRepo = getCacheRepository('devices')

const now = new Date()

export function updateHistory () {
  const clients = clientRepo.find(filterToDate)
  const devices = deviceRepo.find(filterToDate, { status: 1 })
  const lastMonth = deviceRepo.find(filterToLastDate, { status: 1 })
  
  const income = devices.reduce(sumAmount, 0)
  const lastIncome = lastMonth.reduce(sumAmount, 0)
  
  const { id, ...currentHistory } = historyRepo.findOne(history => {
    const date = new Date(history.createdAt)
    if (date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear())
      return history
  }) || {}
  
  const currentHistoryData = {
    date: null,
    totalClients: clients.length,
    totalDevices: devices.length,
    mediaIncome: deviceRepo.find(filterToDate).reduce(sumAmount, 0),
    incomeDifference: {
      value: income - lastIncome,
      date: new Date()
    },
    income,
    clients,
    devices,
    createdAt: new Date(),
    updatedAt: new Date()
  }
  
  
  if (!verifyObject(currentHistory)) {
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
    new Date().getFullYear(), last ? new Date().getMonth() - 1 : new Date().getMonth()))
  return objDate.getTime() >= dateNow.getTime()
}

function sumAmount (acc, cur) {
  return acc += +cur.amount
}

updateHistory()