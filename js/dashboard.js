import { getCacheRepository } from './db.js'
import logout from './logout.js'
import { sessionValidation } from './session-validation.js'
import { api } from './request.js'
import { startStorage } from './post-request.js'
import { firstAppointment, secondAppointment } from './generate-client-appointments.js'
import { createHtmlDevices } from './devices-page.js'
import { updateButton } from './update-button.js'
import { deleteAndUpdate } from './delete-and-update.js'
import { createHtmlClients } from './clients-page.js'

sessionValidation()
document.cookie.split('; ')

const accountsRepo = getCacheRepository('accounts')
const clientsRepo = getCacheRepository('clients')
const devicesRepo = getCacheRepository('devices')

const { company, username } = document.cookie.split(';').reduce((acc, cur) => ({
  ...acc, [cur.split('=')[0].trim()]: cur.split('=')[1].trim()
}), {})

export const account = accountsRepo.findOne({ username })

const links = document.querySelector('.links')
const profBtnElm = document.querySelector('.profile_name')
const companyNameElm = document.querySelector('.company_name')
const logoutBtn = document.querySelector('[data-js="logout"]')
const sectionMainElm = document.querySelector('.main')

logoutBtn.onclick = () => logout()

window.document.title = `Dashboard - ${company}`

document.querySelector('[data-img]').src = `https://avatars.dicebear.com/api/adventurer-neutral/${username}.svg`
profBtnElm.children[0].textContent = account.name

const title = `
 <span class="highlight">${company.charAt(0)}</span>${company.slice(1)}
`
companyNameElm.innerHTML = title

getPage('home')

links.addEventListener('click', linkHandle, { capture: false })
profBtnElm.addEventListener('click', profileHandle)

function linkHandle(event) {
  const clickedElm = event.target
  if (clickedElm.tagName === 'LI' || clickedElm.tagName === 'A') {
    event.preventDefault()
    getPage(clickedElm.dataset.page)
    removeActiveElement({
      target: links,
      element: clickedElm.tagName,
      className: 'active'
    })
    removeActiveElement({ target: links, element: 'a', className: 'active' })
    clickedElm.classList.add('active')
  }
}

function profileHandle(event) {
  profBtnElm.classList.toggle('active')
  profBtnElm.nextElementSibling.classList.toggle('show')
}

function removeActiveElement({ target, element, className }) {
  Array.from(target.querySelectorAll(element))
    .find(el => el.classList.contains(className))
    ?.classList.remove(className)
}

function getPage(page) {
  if (!page) return
  const [first, second] = page.split('/')
  const toPage = (uri) => ({
    register: {
      client: async () => {
        const response = await api.get('/views/cad-client.html')
        sectionMainElm.innerHTML = await response.text()
        firstAppointment(clientsRepo)
        secondAppointment(clientsRepo)
        startStorage()
      },
      device: async () => {
        const response = await api.get('/views/cad-device.html')
        sectionMainElm.innerHTML = await response.text()
        firstAppointment(devicesRepo)
        secondAppointment(devicesRepo)
        const clientElm = document.querySelector('select[name="client"]')
        clientElm.innerHTML += clientsRepo.find()
          .sort((x, y) => {
            let a = x.name.toUpperCase(),
              b = y.name.toUpperCase()
            return a == b ? 0 : a > b ? 1 : -1
          })
          .reduce((acc, cur) => acc += `<option value="${cur.id}">${cur.name} ${cur.surname}</option>`, '')
        startStorage()
      },
    },
    list: {
      client: async () => {
        const response = await api.get('/views/list-clients.html')
        sectionMainElm.innerHTML = await response.text()
        document.querySelector('.main_list-sub').textContent = `${clientsRepo.find().length} clientes`
        const mainListContainer = document.querySelector('.main_list-container')
        showClientContents(mainListContainer)
        mainListContainer.addEventListener('mousemove', e => {
          const element = e.target
          if (element.dataset.textView) {
            const { pageX } = e
            const highlightBox = element.nextElementSibling
            highlightBox.classList.add('show')
            highlightBox.style.setProperty('top', e.target.offsetTop - 5 - highlightBox.offsetHeight + 'px')
            highlightBox.style.setProperty('left', (pageX - mainListContainer.offsetLeft - 210) - (highlightBox.offsetWidth / 2) + 'px')
          }
        })
        mainListContainer.addEventListener('click', e => {
          const main = document.querySelector('.main')
          const clickedElement = e.target
          if (clickedElement.className === 'options') {
            const activeItem = Array.from(document.querySelectorAll('.options-menu'))
              .find(opt => opt.classList.contains('active'))
            activeItem?.classList.remove('active')
            const optionMenuElm = clickedElement.nextElementSibling
            if (activeItem === optionMenuElm) {
              activeItem.classList.remove('active')
              return
            }
            optionMenuElm.classList.add('active')

            const posY = clickedElement.offsetTop + clickedElement.offsetHeight
            const posX = clickedElement.offsetLeft + clickedElement.offsetWidth - optionMenuElm.offsetWidth 

            optionMenuElm.style.setProperty('top', posY + 'px')  
            optionMenuElm.style.setProperty('left', posX + 'px')
            optionMenuElm.lastElementChild.onclick = () => optionMenuElm.classList.remove('active')
          }
          if (e.target.dataset.deviceId) {
            const clickedElement = e.target
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
          if (e.target.dataset.closeId) {
            const contentId = document.querySelector(`[data-device-body="${e.target.dataset.closeId}"]`)
            contentId.classList.remove('show')
          }
          if (e.target.dataset.option) {
            const { option, clientId } = e.target.dataset
            deleteAndUpdate(clientsRepo, option, clientId)()
            showClientContents(mainListContainer)
          }
        })
      },
      device: async () => {
        const response = await api.get('/views/list-devices.html')
        sectionMainElm.innerHTML = await response.text()
        document.querySelector('.main_list-sub').textContent = `${devicesRepo.find().length} dispositivos`
        const mainListContainer = document.querySelector('.main_list-container')
        showDeviceContents(mainListContainer)
        mainListContainer.addEventListener('mousemove', e => {
          const element = e.target
          if (element.dataset.textView) {
            const { pageX } = e
            const highlightBox = element.nextElementSibling
            highlightBox.classList.add('show')
            highlightBox.style.setProperty('top', e.target.offsetTop - 5 - highlightBox.offsetHeight + 'px')
            highlightBox.style.setProperty('left', (pageX - mainListContainer.offsetLeft - 215) - (highlightBox.offsetWidth / 2) + 'px')
          }
        })
        const status = {
          progress: -1,
          awaiting: 0,
          delivered: 1
        }
        let i = 0
        const deviceToUpdateStatus = []
        mainListContainer.addEventListener('click', e => {
          const main = document.querySelector('.main')
          const clickedElement = e.target
          if (clickedElement.className === 'options') {
            const activeItem = Array.from(document.querySelectorAll('.options-menu'))
              .find(opt => opt.classList.contains('active'))
            activeItem?.classList.remove('active')
            const optionMenuElm = clickedElement.nextElementSibling
            if (activeItem === optionMenuElm) {
              activeItem.classList.remove('active')
              return
            }
            optionMenuElm.classList.add('active')

            const posY = clickedElement.offsetTop + clickedElement.offsetHeight
            const posX = clickedElement.offsetLeft + clickedElement.offsetWidth - optionMenuElm.offsetWidth 

            optionMenuElm.style.setProperty('top', posY + 'px')  
            optionMenuElm.style.setProperty('left', posX + 'px')
            optionMenuElm.lastElementChild.onclick = () => optionMenuElm.classList.remove('active')
          }
          if (e.target.dataset.deviceId) {
            const clickedElement = e.target
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
          if (e.target.dataset.option) {
            const { option, deviceId } = e.target.dataset
            deleteAndUpdate(devicesRepo, option, deviceId)()
            showDeviceContents(mainListContainer)
          }
        })
      },
    },
    home: async () => {
      const response = await api.get('/views/main.html')
      sectionMainElm.innerHTML = await response.text()
    },
    history: () => { console.log('history') }
  })[uri]
  second ? toPage(first)[second]() : toPage(first)()
}

function showDeviceContents (elm) {
  const devicesHtmlProgress = devicesRepo.find()
    .filter(data => data.status === -1)
    .reduce(createHtmlDevices, '')
  const devicesHtmlAwaiting = devicesRepo.find()
    .filter(data => data.status === 0)
    .reduce(createHtmlDevices, '')
  const devicesHtmlDelivered = devicesRepo.find()
    .filter(data => data.status === 1)
    .reduce(createHtmlDevices, '')

  elm.innerHTML = (devicesHtmlProgress + devicesHtmlAwaiting + devicesHtmlDelivered) || '<span>Sem produtos cadastrados!</span>'
}

function showClientContents (elm) {
  elm.innerHTML = clientsRepo.find().reduce(createHtmlClients, '') || '<span>Sem clientes no sistema!</span>'
}

function rightClickHandle(e) {
  e.preventDefault()
  if (e.target.dataset.optionContainer) return
  const activeBoxes = Array.from(document.querySelectorAll('.options-menu'))
  activeBoxes.find(box => box.classList.contains('active'))?.classList.remove('active')

  const parent = e.target.closest('.main_list-container--box')
  const optionsMenuElm = parent.querySelector('.options-menu')

  optionsMenuElm.style.setProperty('top', e.clientY  - 81 + 'px')
  optionsMenuElm.style.setProperty('left', e.clientX - 202 + 'px')
  optionsMenuElm.classList.add('active')
}
