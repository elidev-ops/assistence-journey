import { getCacheRepository } from './db.js'
import logout from './logout.js'
import { sessionValidation } from './session-validation.js'
import { api } from './request.js'
import { startStorage } from './post-request.js'
import { firstAppointmentClients, firstAppointmentDevices } from './generate-client-appointments.js'
import { createHtmlDevices } from './devices-page.js'
import { updateButton } from './update-button.js'

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
        firstAppointmentClients()
        startStorage()
      },
      device: async () => {
        const response = await api.get('/views/cad-device.html')
        sectionMainElm.innerHTML = await response.text()
        firstAppointmentDevices()
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
      client: async () => { },
      device: async () => {
        const response = await api.get('/views/list-devices.html')
        sectionMainElm.innerHTML = await response.text()
        document.querySelector('.main_list-sub').textContent = `${devicesRepo.find().length} produtos`
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
          if (e.target.dataset.deviceId) {
            Array.from(document.querySelectorAll('[data-device-body]'))
              .find(elm => elm.classList.contains('show'))?.classList.remove('show')
            const contentId = document.querySelector(`[data-device-body="${e.target.dataset.deviceId}"]`)
            contentId.classList.add('show')

            const posBox = contentId.getBoundingClientRect()
            const posMain = mainListContainer.getBoundingClientRect()
            const posA = posMain.bottom - posMain.height
            const posBoxY = posBox.height + e.target.offsetTop + posA

            if (posBoxY >= posMain.height) {
              contentId.style.setProperty('top', e.target.offsetTop + posA - (posBoxY - posMain.height) + 300 + 'px')
              return
            }

            contentId.style.setProperty('top', e.target.offsetTop + posA + 'px')
            e.target.offsetTop + posBox.height
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

function showDeviceContents(elm) {
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
