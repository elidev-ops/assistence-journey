import { getCacheRepository } from './db.js'
import { CustomError, executeError } from './errors.js'
import { signinValidations, validationComposite } from './validation.js'
import { successElement } from './messages.js'
import { createData } from './create-data.js'
import { sessionValidation } from './session-validation.js'

sessionValidation()

const root = document.querySelector('.root')
const formElm = document.querySelector('[data-js="form"]')

const accountsRepo = getCacheRepository('accounts')

formElm.addEventListener('submit', signInHandle)

function signInHandle (event) {
  event.preventDefault()

  const objectData = createData(event.target)
  const err = validationComposite(signinValidations(objectData))
  
  if (err) {
    executeError(err)
    return
  }

  sendRequest(objectData)
}

async function sendRequest (data) {
  console.log(data)
  const isValid = accountsRepo.find()
    .find(account => account.username === data.username && account.password === data.password)
  
  if (!isValid) {
    executeError(new CustomError('Usuario ou senha estão errado.', 'username'))
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
}
