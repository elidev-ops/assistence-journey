import { getCacheRepository } from './db.js'
import logout from './logout.js'
import { sessionValidation } from './session-validation.js'
import { api } from './request.js'
import { createHtmlDevices } from './devices-page.js'
import { updateButton } from './update-button.js'
import { deleteAndUpdate } from './delete-and-update.js'
import { createHtmlClients } from './clients-page.js'
import { historyComponent } from './history-component.js'
import { observerUpdateData } from './observers.js'
import { Notifyer } from './notify.js'
import { googleapis } from './googleapis.js'
import { EventEmitter } from './emitter.js'
import './create-history.js'

const { log } = console

sessionValidation()
document.cookie.split('; ')

const historyRepo = getCacheRepository('history')
const accountsRepo = getCacheRepository('accounts')
const clientsRepo = getCacheRepository('clients')
const devicesRepo = getCacheRepository('devices')

const notifyer = new Notifyer()
notifyer.init()
notifyer.notify()

function backup () {
  const backupButtonElm = document.querySelector('[data-js="backup"]')
  const backupData = {
    history: historyRepo.find(),
    accounts: accountsRepo.find(),
    clients: clientsRepo.find(),
    devices: devicesRepo.find(),
  }
  const blob = new Blob([
    JSON.stringify(backupData)
  ], { type: 'application/json' })

  backupButtonElm.onclick = () => {
    window.open(URL.createObjectURL(blob))
  }
}

const { company, username } = document.cookie.split(';').reduce((acc, cur) => ({
  ...acc, [cur.split('=')[0].trim()]: cur.split('=')[1].trim()
}), {})

export const account = accountsRepo.findOne({ params: { username } })

const $links = document.querySelector('.links')
const $sectionMainElm = document.querySelector('.main')
const $profBtnElm = document.querySelector('.profile_name')
const $companyNameElm = document.querySelector('.company_name')
const $logoutBtn = document.querySelector('[data-js="logout"]')

$logoutBtn.addEventListener('click', logout)

window.document.title = `Dashboard - ${company}`

document.querySelector('[data-img]').src = `https://avatars.dicebear.com/api/adventurer-neutral/${username}.svg`
$profBtnElm.children[0].textContent = account.name

$companyNameElm.innerHTML = /* html */ `<span class="highlight">D</span>ashboard`

$links.addEventListener('click', sidebarLinkHandle)
$profBtnElm.addEventListener('click', profileHandle)


function sidebarLinkHandle (event) {
  addActiveClassInLink(event.target)
  const uri = event.target.dataset.page
    ?.replace(/\/([a-z])/g, (_, w) => w.toUpperCase())
  navigate(uri)
}

export function addActiveClassInLink (elm) {
  const clickedElementToBeActivate = elm
  const elementToBeDeactivated = Array
    .from($links.querySelectorAll(clickedElementToBeActivate.tagName))
    .filter(elm => elm !== clickedElementToBeActivate)
    .find(elm => elm.classList.contains('active'))
  
  const childrenToBeDeactivated = Array
    .from($links.querySelectorAll('li > ul *'))
    .find(elm => elm.classList.contains('active'))
    
  if (elementToBeDeactivated) {
    elementToBeDeactivated.classList.remove('active')
    childrenToBeDeactivated?.classList.remove('active')
  }
  clickedElementToBeActivate.id ?
    clickedElementToBeActivate.classList.toggle('active') :
    clickedElementToBeActivate.classList.add('active')
}

function profileHandle() {
  $profBtnElm.classList.toggle('active')
  $profBtnElm.nextElementSibling.classList.toggle('show')
}
const emitter = new EventEmitter()

emitter.on('home', routes('home'))
emitter.on('registerClient', routes('registerClient'))
emitter.on('registerDevice', routes('registerDevice'))
emitter.on('listClients', routes('listClients'))
emitter.on('listDevices', routes('listDevices'))
emitter.on('history', routes('history'))

navigate('home')

function to (promise) {
  return promise
    .then(result => [null, result])
    .catch(err => [err])
}

export function navigate (uri, data) {
  emitter.emit(uri, data)
}

function routes (uri) {
  return ({
      registerClient: async () => {
        const response = await api.get('/views/cad-client.html')
        $sectionMainElm.innerHTML = response
        observerUpdateData.publisher('event-page', clientsRepo)
        observerUpdateData.publisher('event-history', devicesRepo)
      },
      registerDevice: async () => {
        const response = await api.get('/views/cad-device.html')
        $sectionMainElm.innerHTML = response
        const clientElm = document.querySelector('#clients')
        clientElm.innerHTML += clientsRepo.find()
          .sort((x, y) => {
            let a = x.name.toUpperCase(),
              b = y.name.toUpperCase()
            return a == b ? 0 : a > b ? 1 : -1
          })
          .reduce((acc, cur) => acc += `<option value="${cur.id}">${cur.name} ${cur.surname}</option>`, '')
          observerUpdateData.publisher('event-page', devicesRepo)
          observerUpdateData.publisher('event-history', devicesRepo)
      },
      listClients: async (data) => {
        const response = await api.get('/views/list-clients.html')
        $sectionMainElm.innerHTML = response
        const totalClient = data ? data.length : clientsRepo.find().length
        document.querySelector('.main_list-sub').textContent = `${totalClient} clientes`
        const mainListContainer = document.querySelector('.main_list-container')
        showClientContents(mainListContainer, data)
        mainListContainer.addEventListener('mousemove', mousemoveHandle)
        mainListContainer.addEventListener('click', e => {
          const clickedElement = e.target

          clickedElement.className === 'options' ? optionMenuHandle(clickedElement) : null
          e.target.dataset.deviceId ? infoDataHandler(e) : null

          
          if (e.target.dataset.closeId) {
            const contentId = document.querySelector(`[data-device-body="${e.target.dataset.closeId}"]`)
            contentId.classList.remove('show')
          }
          if (e.target.dataset.option) {
            const { option, clientId } = e.target.dataset
            deleteAndUpdate(clientsRepo, option, clientId)()
            showClientContents(mainListContainer)
            notifyer.init()
          }
        })
      },
      listDevices: async (data) => {
        const response = await api.get('/views/list-devices.html')
        $sectionMainElm.innerHTML = response
        const totalDevices = data ? data.length : devicesRepo.find().length

        document.querySelector('.main_list-sub').textContent = `${totalDevices} dispositivos`

        const mainListContainer = document.querySelector('.main_list-container')

        showDeviceContents(mainListContainer, data)
        mainListContainer.addEventListener('mousemove', mousemoveHandle)

        const status = {
          progress: -1,
          awaiting: 0,
          delivered: 1
        }
        let i = 0
        const deviceToUpdateStatus = []
        
        mainListContainer.addEventListener('click', e => {
          const clickedElement = e.target

          clickedElement.className === 'options' ? optionMenuHandle(clickedElement) : null
          e.target.dataset.deviceId ? infoDataHandler(e) : null
          
          if (e.target.dataset.closeId) {
            const contentId = document.querySelector(`[data-device-body="${e.target.dataset.closeId}"]`)
            contentId.classList.remove('show')
          }
          if (e.target.tagName === 'BUTTON' && e.target.dataset.id) {
            const updateButtonElm = updateButton()
            const deviceUpdateElm = document.querySelector('.device-update')

            if (!deviceUpdateElm.children.length) deviceUpdateElm.append(updateButtonElm)

            const spanStatus = e.target.children[0]
            const className = spanStatus.classList.item(1)
            const statusEntry = Object.keys(status)

            i = statusEntry.indexOf(className)
            i = ++i % statusEntry.length
            spanStatus.classList.remove(className)
            spanStatus.classList.add(statusEntry[i])
            const id = e.target.dataset.id
            if (!deviceToUpdateStatus.find(d => d.id === id))
              deviceToUpdateStatus.push({
                id,
                status: status[statusEntry[i]]
              })
            deviceToUpdateStatus.map(data => {
              if (data.id === id) {
                data.id = id
                data.status = status[statusEntry[i]]
              }
            })
            updateButtonElm.addEventListener('click', async () => {
              updateButtonElm.classList.add('active')
              for (const data of deviceToUpdateStatus) {
                const { id, status } = data
                devicesRepo.updateOne({ id }, { status })
              }
              observerUpdateData.publisher('event-history', devicesRepo)
              notifyer.init()

              const promise = new Promise(resolve => {
                setTimeout(() => {
                  updateButtonElm.classList.remove('active')
                  updateButtonElm.innerHTML = `<i class='bx bx-check'></i>`
                  updateButtonElm.classList.add('success')
                  showDeviceContents(mainListContainer)
                  resolve()
                }, 2000)
              })
              await promise
              setTimeout(() => updateButtonElm.remove(), 1400)
            })
          }
          if (clickedElement.dataset.osId) {
            const { osId } = clickedElement.dataset            
            if (osId) {
              const main = clickedElement.offsetParent.parentElement
              const osElmToBeOpened = document.querySelector(`[data-os-body="${osId}"]`)
              const osElmToBeClosed = Array
                .from(document.querySelectorAll('[data-os-body]'))
                .filter(elm => elm !== osElmToBeOpened)
                .find(elm => elm.classList.contains('show'))
              
              if (osElmToBeClosed) {
                osElmToBeClosed.classList.remove('show')
              }
              osElmToBeOpened.classList.toggle('show')
              const clickedPosition = clickedElement.offsetTop
              osElmToBeOpened.style.setProperty('top', clickedPosition + 'px')
              main.scroll({
                top: clickedElement.offsetTop,
                left: 0,
                behavior: 'smooth'
              })
            }
          }
          if (e.target.dataset.option) {
            const { option, deviceId } = e.target.dataset
            deleteAndUpdate(devicesRepo, option, deviceId)()
            showDeviceContents(mainListContainer)
            notifyer.init()
          }
        })
      },
    home: async () => {
      const response = await api.get('/views/main.html')
      $sectionMainElm.innerHTML = response
    },
    history: async () => {
      const response = await api.get('/views/history.html')
      $sectionMainElm.innerHTML = response
      document.querySelector('.main_list-sub').textContent = `${historyRepo.find().length} caixas`
      const mainListContainer = document.querySelector('.main_list-container')

      const historyHtml = historyRepo.find()
        .reduce((acc, cur) => acc += historyComponent(cur), '')
        
      mainListContainer.innerHTML = historyHtml
      mainListContainer.addEventListener('click', e => {
        if (e.target.dataset.toggleHistory) {
          const clickedElementId = e.target.dataset.toggleHistory
          const historyToBeOpened = document.querySelector(`[data-history-id="${clickedElementId}"]`)
          const historyToBeClosed = Array
            .from(document.querySelectorAll('[data-history-id]'))
            .filter(historyElm => historyElm !== historyToBeOpened)
            .find(historyElm => historyElm.classList.contains('open'))
          
          if (historyToBeClosed) historyToBeClosed.classList.remove('open')

          historyToBeOpened.classList.toggle('open')
        }
        
        const clickedContentElm =
          e.target.parentNode.nextElementSibling?.querySelector('[data-js="accordion"]')
        clickedContentElm?.addEventListener('click', accordionHeaderClick)
      })
    }
  })[uri]
}

function accordionHeaderClick(event) {
  const accordionHeaderId = event.target.dataset.accordionHeader
  if (accordionHeaderId) {
    const clickedAccordionHeader =
      document.querySelector(`[data-accordion-header="${accordionHeaderId}"]`)
    const accordionItemToBeOpened =
      document.querySelector(`[data-accordion-body="${accordionHeaderId}"]`)
    const accordionHeaderToBeClosed = Array
      .from(document.querySelectorAll('[data-js="accordion-header"]'))
      .filter(accordionHeader => accordionHeader !== clickedAccordionHeader)
      .find(accordionHeader => accordionHeader.classList.contains('open'))

    if (accordionHeaderToBeClosed) {
      closeAccordionItem(accordionHeaderToBeClosed)
    }

    clickedAccordionHeader.classList.toggle('open')
    accordionItemToBeOpened.classList.toggle('open')
  }
  event.stopPropagation()
}

function closeAccordionItem(accordionHeaderToBeClosed) {
  const accordionHeaderId = accordionHeaderToBeClosed.dataset.accordionHeader
  const accordionBodyToBeClosed =
    document.querySelector(`[data-accordion-body="${accordionHeaderId}"]`)

  accordionBodyToBeClosed.classList.remove('open')
  accordionHeaderToBeClosed.classList.remove('open')
}

export function showDeviceContents(elm, data) {
  const repo = data || devicesRepo.find()
  const devicesHtmlProgress = repo
    .filter(data => data.status === -1)
    .reduce(createHtmlDevices, '')
  const devicesHtmlAwaiting = repo
    .filter(data => data.status === 0)
    .reduce(createHtmlDevices, '')
  const devicesHtmlDelivered = repo
    .filter(data => data.status === 1)
    .reduce(createHtmlDevices, '')

  elm.innerHTML = (devicesHtmlProgress + devicesHtmlAwaiting + devicesHtmlDelivered) || '<span>Sem produtos cadastrados!</span>'
}

export function showClientContents(elm, data) {
  const repo = data || clientsRepo.find()
  elm.innerHTML = repo.reduce(createHtmlClients, '') || '<span>Sem clientes no sistema!</span>'
}

function mousemoveHandle(e) {
  const element = e.target
  if (element.dataset?.textView) {
    const { pageX } = e
    const mainListContainer = e.target.closest('.main_list-container')
    const highlightBox = element.nextElementSibling
    highlightBox.classList.add('show')
    highlightBox.style.setProperty('top', e.target.offsetTop - 5 - highlightBox.offsetHeight + 'px')
    highlightBox.style.setProperty('left', (pageX - mainListContainer.offsetLeft - 210) - (highlightBox.offsetWidth / 2) + 'px')
  }
}

function optionMenuHandle(elm) {
  const activeItem = Array.from(
    document.querySelectorAll('.options-menu')
  ).find(opt => opt.classList.contains('active'))
  activeItem?.classList.remove('active')
  const optionMenuElm = elm.nextElementSibling
  if (activeItem === optionMenuElm) {
    activeItem.classList.remove('active')
    return
  }
  optionMenuElm.classList.add('active')

  const posY = elm.offsetTop + elm.offsetHeight
  const posX =
    elm.offsetLeft +
    elm.offsetWidth -
    optionMenuElm.offsetWidth

  optionMenuElm.style.setProperty('top', posY + 'px')
  optionMenuElm.style.setProperty('left', posX + 'px')
  optionMenuElm.lastElementChild.onclick = () =>
    optionMenuElm.classList.remove('active')
}

function infoDataHandler(e) {
  const clickedElement = e.target
  const main = e.target.offsetParent.parentElement

  Array.from(document.querySelectorAll('[data-device-body]'))
    .find(elm => elm.classList.contains('show'))?.classList.remove('show')

  const contentId = document.querySelector(`[data-device-body="${e.target.dataset.deviceId}"]`)
  contentId.classList.add('show')
  
  const clickedPosition = clickedElement.offsetTop
  contentId.style.setProperty('top', clickedPosition + 'px')
  main.scroll({
    top: e.target.offsetTop,
    left: 0,
    behavior: 'smooth'
  })
}

backup()
