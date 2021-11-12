import { getCacheRepository } from './db.js'
import { createData } from './create-data.js'
import { executeError } from './errors.js'
import { validationComposite, clientValidations, deviceValidations } from './validation.js'
import { saveMessage } from './messages.js'
import uuidv4 from './uuid.js'
import { account } from './dashboard.js'

const mainBoxContainerElm = document.querySelector('.main-box_content')
const buttonSaveElm = document.querySelector('[data-js="save"]')

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

const postRequest = (request) => ({
  postClient: (data) => {
    const { name, surname, username } = account
    const clientsRepo = getCacheRepository('clients')

    data.id = uuidv4()
    data.employee = { name, surname, username }
    data.status = 'progress'
    data.createdAt = new Date()
    data.updatedAt = new Date()
    const exists = clientsRepo.findOne({ fone: data.fone })

    if (!exists) {
      clientsRepo.insert(data)
    }
    return exists !== undefined
  },
  postDevice: (data) => {
    const { name, surname, username } = account
    const clientsRepo = getCacheRepository('clients')
    const devicesRepo = getCacheRepository('devices')
    const client = clientsRepo.findOne({ id: data.client })
    
    data.id = uuidv4()
    data.employee = { name, surname, username }
    data.client = {
      id: client.id,
      name: `${client.name} ${client.surname}`,
      phone: client.phone,
      email: client.email
    }
    data.createdAt = new Date()
    data.updatedAt = new Date()   

    devicesRepo.insert(data)
  }
})[request] || undefined

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
    await activeButtonSend()
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

async function activeButtonSend() {
  return new Promise(resolve => {
    buttonSaveElm.classList.add('sending')
    if (!timeOut) {
      timeOut = setTimeout(() => {
        buttonSaveElm.classList.remove('sending')
        timeOut = null
        resolve()
      }, 3600)
    }
  })
}

