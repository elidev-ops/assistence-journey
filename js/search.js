import { EventEmitter } from './emitter.js'
import { createData } from './create-data.js'
import { getCacheRepository } from './db.js'
import { addActiveClassInLink, navigate } from './dashboard.js'

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
  const newRegex = regex(`^.*${params.search}.*$`)
  
  const defaultURI = `list/${params.option}`
  const uri = 'list' + params.option.charAt(0).toUpperCase() + params.option.slice(1)
  
  const includeSecret = params.search.includes(':')
  const secretIndexOf = params.search.trim().indexOf(':') + 1 
  
  const dataSearch = repo.find(data => includeSecret ?
    data.status ===  +params.search.trim().slice(secretIndexOf) :
    newRegex.test(data[paramSearch(params.option)].toLowerCase()))
  
  navigate(uri, dataSearch)
  activeLinkSearch(defaultURI)
}

function activeLinkSearch (uri) {
  const linkToBeActivated = document.querySelector(`[data-page="${uri}"]`)
  const boxToBeOpened = linkToBeActivated.closest('#dropdown')
  const boxToBeClosed = getElmToBeClosed(boxToBeOpened, '#dropdown')
  const linkToBeDeactivated = getElmToBeClosed(linkToBeActivated, '[data-page]')
  console.log(boxToBeOpened)
  addActiveClassInLink(boxToBeOpened)

  if (boxToBeClosed && linkToBeDeactivated) {
    boxToBeClosed.classList.remove('active')
    linkToBeDeactivated.classList.remove('active')
  }

  linkToBeActivated.classList.add('active')
  boxToBeOpened.classList.add('active')
}

function getElmToBeClosed (toBeOpenedElm, selector) {
  return Array
    .from(document.querySelectorAll(selector))
    .filter(box => box !== toBeOpenedElm)
    .find(box => box.classList.contains('active'))
}

function regex (value) {
  return new RegExp(value.trim().toLowerCase(), 'i')
}