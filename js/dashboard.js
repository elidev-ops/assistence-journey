import { getCacheRepository } from './db.js'
import logout from './logout.js'
import { sessionValidation } from './session-validation.js'

sessionValidation()
document.cookie.split('; ')

const accountsRepo = getCacheRepository('accounts')
const clientsRepo = getCacheRepository('clients')

const { company, username } = document.cookie.split(';').reduce((acc, cur) => ({
  ...acc, [cur.split('=')[0].trim()]: cur.split('=')[1].trim()
}), {})

export const account = accountsRepo.findOne({ username })
const clients = clientsRepo.find()
console.log(clients)
const links = document.querySelector('.links')
const profBtnElm = document.querySelector('.profile_name')
const companyNameElm = document.querySelector('.company_name')
const clientElm = document.querySelector('select[name="client"]')
const logoutBtn = document.querySelector('[data-js="logout"]')

logoutBtn.onclick = () => logout()

window.document.title = `Dashboard - ${company}`

document.querySelector('[data-img]').src = `https://avatars.dicebear.com/api/adventurer-neutral/${username}.svg`
profBtnElm.children[0].textContent = account.name

const title = `
 <span class="highlight">${company.charAt(0)}</span>${company.slice(1)}
`
companyNameElm.innerHTML = title

links.addEventListener('click', linkHandle)
profBtnElm.addEventListener('click', profileHandle)

function linkHandle (event) {
  const clickedElm = event.target
  if (clickedElm.tagName === 'LI' || clickedElm.tagName === 'A') {
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

const dataText = document.querySelectorAll('[data-text]')

// const clientsBox = clients
//   ?.reverse()
//   ?.filter((_, index) => index <= 4)
//   .reduce((acc, cur) => acc += `
//     <div class="client-box">
//       <div class="appointment-icon">
//         <i class="bx bxs-user"></i>
//       </div>
//       <strong class="name-client">${cur.name}</strong>
//       <span>Novo</span>
//     </div>
//   `, '') || 'Sem entradas de clientes'

// const firstAppointment = document.querySelector('.fist-appointment')
// firstAppointment.innerHTML = clientsBox

// clientElm.innerHTML += clients.reduce((acc, cur) => acc += `<option value="${cur.id}">${cur.name}</option>`, '')
