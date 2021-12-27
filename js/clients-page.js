import { createShortDate, createNumberWhatsapp, createDateBrazil, createBadge } from './utils.js'

export function createHtmlClients (acc, cur, index, arr) {
  if (index === 0) acc += /* html */
    `<div class="main_list-container-block">
      <div class="main_list-container--header client">
        <span class="progress">Nome</span>
        <span>Data</span>
        <span>Email</span>
        <span>Whatsapp</span>
        <span>Técnico</span>
        <span>OPT</span>
      </div>`
  acc += /* html */ `<div class="main_list-container--box client">
    <div class="encapsulation">
      <span data-device-id="${cur.id}" class="encapsulation-title">${cur.name} ${cur.surname}</span>
      <div data-device-body="${cur.id}" class="main_list-container--content">
        <button data-close-id="${cur.id}" class="close">
          <i class='bx bx-plus'></i>
        </button>
        <h2>${cur.name} ${cur.surname} ${createBadge(cur.createdAt)}</h2>
        <span>Email: ${cur.email}</span>
        <span>
          Numero: ${createNumberWhatsapp(cur.phone)}
          <span class="badge">
            <i class='bx bxl-whatsapp'></i>
            Whatsapp
          </span>
        </span>
        <span>Entrada: ${createDateBrazil(cur.createdAt, 'long')}</span>
        <span>Atualizado: ${createDateBrazil(cur.updatedAt, 'long')}</span>
      </div>
    </div>
    <div class="encapsulation">
      <span class="show-text" data-text-view="1">${createShortDate(cur.updatedAt)}</span>
      <span class="hint">${Intl.DateTimeFormat('pt-BR', { dateStyle: 'full', timeStyle: 'long' }).format(new Date(cur.updatedAt))}</span>
    </div>
    <div className="encapsulation">
      <span class="show-text" data-text-view="1">${cur.email}</span>
      <span class="hint">${cur.email}</span>
    </div>
    <div class="encapsulation">
      <a class="show-text" data-text-view="1" target="_blank" href="https://api.whatsapp.com/send?phone=${encodeURIComponent(createNumberWhatsapp(cur.phone))}&text=${encodeURIComponent('Olá')}">${createNumberWhatsapp(cur.phone)}</a>
      <span class="hint">
        <i class='bx bxl-whatsapp'></i>
        ${createNumberWhatsapp(cur.phone)}
      </span>
    </div>
    <div class="encapsulation">
      <span class="show-text" data-text-view="1">${cur.employee.name}</span>
      <span class="hint">${cur.employee.name}</span>
    </div>
    <div class="encapsulation">
      <button class="options">
        <i class='bx bx-dots-horizontal-rounded'></i>
      </button>
      <div data-option-container="container" class="options-menu">
        <button data-option-container="container" data-option="update" data-client-id="${cur.id}">
          <i class='bx bx-edit'></i>
        </button>
        <button data-option-container="container" data-option="delete" data-client-id="${cur.id}">
          <i class='bx bx-trash' ></i>
        </button>
        <button class="close">
          <i class='bx bx-plus'></i>
        </button>
      </div>
    </div>
  </div>`
  if (arr.lastIndexOf(cur) === arr.length - 1) acc += `</div>`
  return acc
}