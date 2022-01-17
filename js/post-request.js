import { getCacheRepository } from './db.js'
import { createData } from './create-data.js'
import { executeError } from './errors.js'
import { validationComposite, clientValidations, deviceValidations } from './validation.js'
import { saveMessage } from './messages.js'
import uuidv4 from './uuid.js'
// import { account } from './dashboard.js'
import { observerUpdateData } from './observers.js'
import { EventEmitter } from './emitter.js'


let timeOut = null

const configForm = (from) => ({
  postClient: {
    message: 'Cliente cadastrado com sucesso!',
    validation: (data) => clientValidations(data)
  },
  postDevice: {
    message: 'Dispositivo cadastrado com sucesso!',
    validation: (data) => deviceValidations(data)
  }
})[from] || 'err 400 - Algo de errado não esta certo'

const postRequest = (request) => (data) => emitter.emit(request, data)

const emitter = new EventEmitter()
emitter.on('postClient', postClient)
emitter.on('postDevice', postDevice)

function postClient (data) {
  const { name, surname, username } = account
  const clientsRepo = getCacheRepository('clients')

  data.id = uuidv4()
  data.employee = { name, surname, username }
  data.createdAt = new Date()
  data.updatedAt = new Date()
  const exists = clientsRepo.findOne({ params: { phone: data.phone } })

  if (!exists) {
    clientsRepo.insert(data)
    observerUpdateData.publisher('event-page', clientsRepo)
    observerUpdateData.publisher('event-history')
  }
  
  return exists !== undefined
}

function postDevice (data) {
  const { name, surname, username } = account
  const clientsRepo = getCacheRepository('clients')
  const devicesRepo = getCacheRepository('devices')
  const client = clientsRepo.findOne({ params: { id: data.client } })
  
  data.id = uuidv4()
  data.employee = { name, surname, username }
  data.client = {
    id: client.id,
    name: `${client.name} ${client.surname}`,
    phone: client.phone,
    email: client.email
  }
  data.status = -1
  data.createdAt = new Date()
  data.updatedAt = new Date()   

  devicesRepo.insert(data)
  observerUpdateData.publisher('event-page', devicesRepo)
  observerUpdateData.publisher('event-history')
}

export function startStorage () {
  const mainBoxContainerElm = document.querySelector('.main-box_content')
  const buttonSaveElm = document.querySelector('[data-js="save"]')
  mainBoxContainerElm.addEventListener('submit', async e => {
    e.preventDefault()
    const formElm = e.target
  
    if (formElm.tagName === 'FORM') {
      const key = formElm.dataset.form
      const objectData = createData(formElm)
      const err = validationComposite(configForm(key).validation(objectData))
      
      if (err) {
        executeError(err)
        return
      }
      await activeButtonSend(buttonSaveElm)
      const request = postRequest(key)(objectData)
      const msgElm = !request ? saveMessage({
        msg: configForm(key).message,
        className: 'success'
      }) : saveMessage({
        msg: 'Error: Numero de cliente já cadastrado no sistema!',
        className: 'error'
      })
      document.querySelector('[data-form]').append(msgElm)
      setTimeout(() => msgElm.remove(), 3400)
    }
  })
}

export async function activeButtonSend(btn) {
  return new Promise(resolve => {
    btn.classList.add('sending')
    if (!timeOut) {
      timeOut = setTimeout(() => {
        btn.classList.remove('sending')
        timeOut = null
        resolve()
      }, 3600)
    }
  })
}

