import { createShortDate, convertToReal, createDateBrazil } from './utils.js'

const status = [
  {
    name: 'Em andamento',
    className: 'progress',
    status: -1
  },
  {
    name: 'Aguardando',
    className: 'awaiting',
    status: 0
  },
  {
    name: 'Entregue',
    className: 'delivered',
    status: 1
  }
]

function getStatusName (sts) {
  return status.find(obj => obj.status === sts)
}

export function createHtmlDevices (acc, cur, index, arr) {
  if (index === 0) acc +=
    `<div class="main_list-container-block ${getStatusName(cur.status).className}" data-status="${getStatusName(cur.status).name}">
      <div class="main_list-container--header">
        <span></span>
        <span>Atualizado</span>
        <span>Status</span>
        <span>Cliente</span>
        <span>Técnico</span>
        <span>OPT</span>
      </div>`
  acc += `<div class="main_list-container--box">
    <div class="encapsulation">
      <span data-device-id="${cur.id}" class="encapsulation-title">${cur.brand} ${cur.model}</span>
      <div data-device-body="${cur.id}" class="main_list-container--content">
        <button data-close-id="${cur.id}" class="close">
          <i class='bx bx-plus'></i>
        </button>
        <h2>Informação</h2>
        <span>${cur.brand} ${cur.model}</span>
        <span>Valor do serviço: ${convertToReal(cur.amount)}</span>
        <span>Local: ${cur.storeroom}</span>
        <span>Cliente: ${cur.client.name}</span>
        <span>Tecnico: ${cur.employee.name}</span>
        <span>Status do serviço: ${getStatusName(cur.status)?.name}</span>
        <span>Entrada: ${createDateBrazil(cur.createdAt, 'long')}</span>
        <span>Atualizado: ${createDateBrazil(cur.updatedAt, 'long')}</span>
        <p><strong>Notas: </strong>${cur.description}</p>
      </div>
    </div>
    <div class="encapsulation">
      <span class="show-text" data-text-view="1">${createShortDate(cur.updatedAt)}</span>
      <span class="hint">${Intl.DateTimeFormat('pt-BR', { dateStyle: 'full', timeStyle: 'long' }).format(new Date(cur.updatedAt))}</span>
    </div>
    <button class="status" data-id="${cur.id}">
      <span class="status-icon ${getStatusName(cur.status)?.className}"></span>
    </button>
    <div class="encapsulation">
      <span class="show-text" data-text-view="1">${cur.client.name}</span>
      <span class="hint">${cur.client.name}</span>
    </div>
    <div class="encapsulation">
      <span class="show-text" data-text-view="1">${cur.employee.name}</span>
      <span class="hint">${cur.employee.name}</span>
    </div>
    <button class="options">
      <i class='bx bx-dots-horizontal-rounded'></i>
    </button>
  </div>`
  if (arr.lastIndexOf(cur) === arr.length - 1) acc += `</div>`
  return acc
}