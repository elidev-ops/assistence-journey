import { EventEmitter } from './emitter.js'
import { createData } from './create-data.js'
import { getCacheRepository } from './db.js'
import { getPage } from './dashboard.js'

const searchEmitter = new EventEmitter()
searchEmitter.on('event:search', submitHandle)

const searchFormElm = document.querySelector('[data-form="search"]')

const paramSearch = (param) => ({
  clients: 'name',
  devices: 'model'
})[param]

searchFormElm.addEventListener('submit', event => {
  searchEmitter.emit('event:search', event)
})

function submitHandle (event) {
  event.preventDefault()

  const params = createData(event.target)
  const repo = getCacheRepository(params.option)
  const newRegex = regex(params.search)

  const includeSecret = params.search.includes(':')
  const secretIndexOf = params.search.trim().indexOf(':') + 1 

  console.log(includeSecret)
  const dataSearch = repo.find(data => includeSecret ?
    data.status ===  +params.search.trim().slice(secretIndexOf) :
    newRegex.test(data[paramSearch(params.option)].toLowerCase()))
  
  getPage(`list/${params.option}`, dataSearch)
}

function regex (value) {
  return new RegExp(value.trim().toLowerCase())
}