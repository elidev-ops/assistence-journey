import { msgErrorElement } from './messages.js'

let timeElement = null

export class CustomError extends Error {
  constructor (msg, inputName) {
    super(msg)
    this.name = 'CustomError'
    this.input = inputName
  }
}

export function executeError (error) {
  if (timeElement) return
  const errElement = msgErrorElement('error', error.message)
  const { parentElement } = document.querySelector(`*[name="${error.input}"]`)
  
  parentElement.append(errElement)

  timeElement = setTimeout(() => {
    errElement.remove()
    timeElement = null
  }, 3000)
}
