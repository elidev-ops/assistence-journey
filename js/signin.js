import { getCacheRepository } from './db.js'
import { CustomError, executeError } from './errors.js'
import { signinValidations, validationComposite } from './validation.js'
import { successElement } from './messages.js'
import { createData } from './create-data.js'
import { sessionValidation } from './session-validation.js'

const { log } = console

sessionValidation()

const root = document.querySelector('.root')
const loginContainerElm = document.querySelector('.login-container')

const accountsRepo = getCacheRepository('accounts')

const logeddin = JSON.parse(localStorage.getItem('logeddin')) || []
const users = logeddin.filter(user => user.logeddin)
const firstScreen = () => {
  const logeddin = JSON.parse(localStorage.getItem('logeddin')) || []
  const users = logeddin.filter(user => user.logeddin)
  return users.reduce((acc, cur, index, arr) => {
    if (index === 0) acc += /* html */ `
      <div class="login-content">
        <h1>Quem é você?</h1>
        <div class="logged-container">`
    acc += /* html */ `
          <button data-logged-id="${cur.username}" class="account-logged">
            <span class="close" data-logged-id="${cur.username}">
              <i class="bx bx-x"></i>
            </span>
            <span data-logged-id="${cur.username}">${atFirst(cur.name)}</span>
          </button>`
    if (arr.lastIndexOf(cur) === arr.length - 1) {
      acc += /* html */ `
          </div>
          <button data-html-restore="true" class="default">
            <span>Entrar com outra conta.</span>
          </button>
          </div>`
    }
    return acc
  }, '')
}

const previousHtmlForm = loginContainerElm.innerHTML

logeddin.length ? loginContainerElm.innerHTML = firstScreen() : null

loginContainerElm.addEventListener('click', event => {
  const clickedElm = event.target
  const username = clickedElm.dataset.loggedId
  if (username) {
    if (clickedElm.tagName === 'SPAN') {
      removeRememberMe(username)
      return
    }
    const restOfScreens = users.find(u => u.username === username)
    const userHtmlSecondary = /* html */ `
      <div class="login-content" data-profile-id="${restOfScreens.username}">
        <button data-to-first="true">
          <i class='bx bx-left-arrow-alt'></i>
        </button>
        <span class="account-logged">
          <span>${atFirst(restOfScreens.name)}</span>
        </span>
        <h1>Bem-vindo de volta ${restOfScreens.username}!</h1>
        <form data-js="form">
          <div class="input-box">
            <input type="hidden" name="username" value="${restOfScreens.username}">
            <input type="password" name="password" placeholder="Senha">
          </div>
          <button class="btn" data-js="signin">
            <span>Entrar</span>
          </button>
        </form>
        <div class="navigate">
          <button data-html-restore="true" class="default">
            <span>Entrar com outra conta.</span>
          </button>
        </div>
      </div>
    `
    loginContainerElm.innerHTML = userHtmlSecondary
    document.querySelector('input[type="password"]').focus()
  }
  if (clickedElm.dataset.toFirst) {
    loginContainerElm.innerHTML = firstScreen()
  }
  if (clickedElm.dataset.htmlRestore) {
    loginContainerElm.innerHTML = previousHtmlForm
  }
})

document.addEventListener('submit', signInHandle)

async function signInHandle(event) {
  event.preventDefault()

  const objectData = createData(event.target)
  const err = validationComposite(signinValidations(objectData))


  if (err) {
    executeError(err)
    return
  }

  const response = await sendRequest(objectData)

  const logeddin = JSON.parse(localStorage.getItem('logeddin')) || []
  const filterUser = logeddin.filter(user => user.username !== response)
  localStorage.setItem('logeddin', JSON.stringify([
    ...filterUser,
    { username: response[0], name: response[1], logeddin: event.target['rememberMe'].checked }
  ]))
}

function removeRememberMe(username) {
  document.querySelector(`[data-logged-id="${username}"]`).remove()
  const logeddin = JSON.parse(localStorage.getItem('logeddin')) || []
  const filterUser = logeddin.filter(user => user.username !== username)
  localStorage.setItem('logeddin', JSON.stringify(filterUser))
  if (!filterUser.length) {
    window.location.reload()
  }
}

function atFirst(name) {
  const arr = name.split(' ')
  return arr[0].charAt(0) + arr[1].charAt(0)
}

async function sendRequest(data) {
  const isValid = accountsRepo.find()
    .find(account => account.username === data.username && account.password === data.password)

  if (!isValid) {
    executeError(new CustomError('Usuário ou senha estão errado.', 'username'))
    return
  }
  let previousContext = null
  const btn = document.querySelector('[data-js="signin"]')

  previousContext = btn.innerHTML
  btn.innerHTML = '<span class="loading"></span>'

  const promise = new Promise((resolve) => {
    setTimeout(() => {
      btn.innerHTML = previousContext
      resolve(data)
    }, 2000)
  })

  await promise

  const successElm = successElement(`${data.username} logado com sucesso, voce sera redirecionado para o dashboard.`)
  const loginContainer = document.querySelector('.login-container')
  successElm.style.top = loginContainer.offsetTop + 'px'
  root.prepend(successElm)
  setTimeout(() => {
    successElm.remove()
    window.location.replace('dashboard.html')
  }, 3500)

  let date = new Date()
  date = new Date(Date.UTC(date.getFullYear(), date.getMonth() + 1, date.getDate() + 1))
  const dateCookie = Intl.DateTimeFormat('en-GB', { dateStyle: 'short' }).format(date)
  document.cookie = `username=${isValid.username}; expires=Thu; ${dateCookie}; path=/;`
  document.cookie = `company=${isValid.company}; expires=Thu; ${dateCookie}; path=/;`
  return [isValid.username, isValid.name]
}
