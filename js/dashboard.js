import { getCacheRepository } from './db.js'
import logout from './logout.js'
import { sessionValidation } from './session-validation.js'
import { api } from './request.js'
import { startStorage } from './post-request.js'
import { firstAppointment } from './generate-client-appointments.js' 

sessionValidation()
document.cookie.split('; ')

const accountsRepo = getCacheRepository('accounts')
const clientsRepo = getCacheRepository('clients')

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

links.addEventListener('click', linkHandle)
profBtnElm.addEventListener('click', profileHandle)

function linkHandle (event) {
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

function profileHandle (event) {
  profBtnElm.classList.toggle('active')
  profBtnElm.nextElementSibling.classList.toggle('show')
}

function removeActiveElement ({ target, element, className }) {
  Array.from(target.querySelectorAll(element))
    .find(el => el.classList.contains(className))
    ?.classList.remove(className)
}

function getPage (page) {
  if (!page) return
  const [first, second] = page.split('/')
  const toPage = (uri) => ({
    register: {
      client: async () => {
        const response = await api.get('/views/cad-client.html')
        sectionMainElm.innerHTML = await response.text()
        firstAppointment()
        startStorage()
      },
      device: async () => {
        const response = await api.get('/views/cad-device.html')
        sectionMainElm.innerHTML = await response.text()
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
      client: async () => {},
      device: async () => {
        const response = await api.get('/views/list-devices.html')
        sectionMainElm.innerHTML = await response.text()
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

const dataText = document.querySelectorAll('[data-text]')
