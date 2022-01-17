import { getCacheRepository } from './db.js'
import { EventEmitter } from './emitter.js'

const notifyEmitter = new EventEmitter()
notifyEmitter.on('event:change-class', notifyChangeClass)
notifyEmitter.on('event:remove-element', removeNotifyElm)
notifyEmitter.on('event:notify', startNotify)
const unsubscribeActiveNotifyBtn = notifyEmitter.on('event:active-button', activeNotifyButton)

function notifyChangeClass(elm) {
  elm.nextElementSibling.classList.toggle('show')
}

function notifyHandle(event) {
  notifyEmitter.emit('event:change-class', event.target)
}

function activeNotifyButton({ elm, data }) {
  elm.classList.add('notify')
  elm.dataset.notifyCount = data.length
}

function removeNotifyElm (elm) {
  elm.remove()
}

const notifyMsg = {
  '-1': {
    msg: 'está em atraso brincadeira brincadeira!',
    icon: 'bx bxs-error-circle'
  },
  '0': {
    msg: 'cliente ainda não buscou? Ai da uma pegada!',
    icon: 'bx bxs-help-circle'
  }
}

export function Notifyer() {
  this.devices = null
}

Notifyer.prototype.init = function () {
  const devicesRepo = getCacheRepository('devices')
  this.devices = devicesRepo.find(device => {
    const devData = new Date(device.updatedAt)
      .getTime() + (24 * 60 * 60 * 1000)
    const now = new Date().getTime()
    if (devData < now && device.status < 1) return device
  })

  const notifyButton = document.querySelector('[data-js="notifications"]')

  if (this.devices.length) {
    notifyEmitter.emit('event:active-button', { elm: notifyButton, data: this.devices })
    unsubscribeActiveNotifyBtn()
  }
  const notifyHtml = this.devices.reduce((acc, cur) => acc += /* html */ `
    <span>
      <i class='${notifyMsg[cur.status].icon}'></i>
      ${cur.model} ${notifyMsg[cur.status].msg}
    </span>
  `, '')

  notifyButton.nextElementSibling.innerHTML = notifyHtml || '<span>Sem notificações!</span>'
  notifyButton.addEventListener('click', notifyHandle)
}

Notifyer.prototype.notify = function () {
  if (this.devices.length) {
    setTimeout(() => {
      notifyEmitter.emit('event:notify', this.devices)
      Notifyer.prototype.notify.call(this, this.devices)
    }, 300000)
  }
}

async function startNotify (data) {
  for (const device of data) {
    const notifyHtml = /* html */ `
      <div data-notify-id="${device.id}" class="notify-alert">
        <i class='bx bxs-error'></i>
        <span class="notify-alert_text">
          Produto em atraso
          <span>${device.brand} ${device.model}</span>
        </span>
        <button data-close-notify="${device.id}" class="notify-alert_button">
          <i class='bx bx-x'></i>
        </button>
      </div>`

    document.querySelector('#root')
      .insertAdjacentHTML('afterbegin', notifyHtml)
    document.querySelector('[data-close-notify]')
      .addEventListener('click', function () {
        notifyEmitter.emit('event:remove-element', this.offsetParent)
      })
      
    const removeAlertAuto = new Promise(resolve => {
      setTimeout(() => {
        document.querySelector(`[data-notify-id="${device.id}"]`)?.remove()
        resolve()
      }, 5000)
    })
    await removeAlertAuto
  }
}