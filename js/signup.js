import { getCacheRepository } from './db.js'
import { CustomError, executeError } from './errors.js'
import { signupValidations, validationComposite } from './validation.js'
import { successElement } from './messages.js'
import { createData } from './create-data.js'

const root = document.querySelector('.root')
const formElm = document.querySelector('[data-js="form"]')
const accountRepo = getCacheRepository('accounts')
formElm.addEventListener('submit', signUpHandle)

function signUpHandle (event) {
  event.preventDefault()

  const objectData = createData(event.target)

  const getAccounts = accountRepo.find('accounts')
  const validAccount = getAccounts.find(account => 
    account.username.toLowerCase() === objectData.username.toLowerCase()
      || account.email.toLowerCase() === objectData.email.toLowerCase())

  const err = validationComposite(signupValidations(objectData))
  
  if (err) {
    executeError(err)
    return
  }

  if (validAccount) {
    executeError(new CustomError('Usuario ou email já existe no nosso sistema', 'username'))
    return
  }

  delete objectData.passwordConfirmation
  sendRequest(objectData)
}

async function sendRequest (data) {
  accountRepo.insert(data)
  let previousContext = null
  const btn = document.querySelector('[data-js="signup"]')

  previousContext = btn.innerHTML
  btn.innerHTML = '<span class="loading"></span>'

  const promise = new Promise((resolve) => {
    setTimeout(() => {
      btn.innerHTML = previousContext
      resolve(data)
    }, 2000)
  })

  await promise

  const successElm = successElement(`Usuário ${data.username} cadastrado com sucesso.`)
  const loginContainer = document.querySelector('.login-container')
  successElm.style.top = loginContainer.offsetTop + 'px'
  root.prepend(successElm)
  setTimeout(() => successElm.remove(), 3500)
}
