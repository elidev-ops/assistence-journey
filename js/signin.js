import { getCacheRepository } from './db.js'
import { CustomError, executeError } from './errors.js'
import { signinValidations, validationComposite } from './validation.js'
import { successElement } from './messages.js'
import { createData } from './create-data.js'
import { sessionValidation } from './session-validation.js'

sessionValidation()

const root = document.querySelector('.root')
const formElm = document.querySelector('[data-js="form"]')
const loginContainerH1 = document.querySelector('.login-container h1')
const logeddinElm = document.querySelector('[data-js="logeddin"]')

const accountsRepo = getCacheRepository('accounts')

const logeddin = JSON.parse(localStorage.getItem('logeddin')) || []
const usersHtml = logeddin
  .filter(user => user.logeddin)
  .reduce((acc, cur) => acc += /* html */ `
    <button data-logeddin-username="${cur.username}" class="logeddin-btn">
      <span class="close-logeddin" data-logeddin-username="${cur.username}">x</span>
      ${atFirst(cur.name)}
    </button>`, '')
logeddinElm.innerHTML = usersHtml

logeddinElm.addEventListener('click', event => {
  const clickedElm = event.target
  if (clickedElm.dataset.logeddinUsername) {
    const username = clickedElm.dataset.logeddinUsername

    if (clickedElm.tagName === 'SPAN') {
      removeRememberMe(username)
      window.location.reload()
    }

    loginContainerH1.innerHTML = `Bem vindo de volta ${username}`

    formElm.innerHTML = /* html */ `
      <div class="input-box">
        <input type="hidden" name="username" value="${username}">
      </div>
      <div class="input-box">
        <input type="password" name="password" placeholder="Senha">
      </div>
      <button class="btn" data-js="signin">
        <span>Entrar</span>
      </button>
    `
  }
  event.stopPropagation()
})

formElm.addEventListener('submit', signInHandle)

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
    { username: response[0], name: response[1],  logeddin: event.target['rememberMe'].checked }
  ]))
}

function removeRememberMe (username) {
  document.querySelector(`[data-logeddin-username="${username}"]`).remove()
  const logeddin = JSON.parse(localStorage.getItem('logeddin')) || []
  const filterUser = logeddin.filter(user => user.username !== username)
  localStorage.setItem('logeddin', JSON.stringify(filterUser))
}

function atFirst (name) {
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
