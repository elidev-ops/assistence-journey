import {
  shortUuidv4,
  createShortDate,
  simpleReal,
  percentageMonthlyGrowth,
  simplePercent
} from './utils.js'

function createTopData (data = [], config) {
  const response = (config) => ({
    client: () => {
      return Object.entries(data?.reduce((acc, { client, amount }) => ({
        ...acc,
        [client.name]: (acc[client.name] || 0) + +amount })
      ,{}))
    },
    device: () => {
      return Object.entries(data.reduce((acc, { model, amount }) => ({
        ...acc,
        [model]: (acc[model] || 0) + +amount })
      ,{}))
    }
  })[config]
  return response(config)().length ? 
    response(config)().reduce((prev, current) => 
  prev[1] > current[1] ? prev : current) :
    []
}

function classFromPercent (current, last) {
  return Math.sign(current - last) > 0 ? 'plus' : 'minus'
}

export const historyComponent = (data) => /* html */ `
  <div class="history-container" data-history-id="${data.id}">
    <div class="history-header">
      <div class="history-header__title">
        <i class='bx bx-calendar-alt'></i>
        <h1>${shortUuidv4(data.id)} - ${createShortDate(data.createdAt)} | <span class="${data.date ? 'closed' : 'opened'}">${data.date ? 'Fechado' : 'Aberto'}</span></h1>
      </div>
      <div class="history-header__info">
        <i class='bx bx-devices' ></i>
        <span>${data.totalDevices} Dispositivos</span>
      </div>
      <div class="history-header__info">
        <i class='bx bx-user' ></i>
        <span>${data.totalClients} Clientes</span>
      </div>
      <div class="history-header__info">
        <span class="small">$</span>
        <span>${data.income === data.mediaIncome ? simpleReal(data.income) : simpleReal(data.income) + ' - ' + simpleReal(data.mediaIncome)}</span>
      </div>
      <button class="btn-default" data-toggle-history="${data.id}"></button>
    </div>
    <div class="history-content">
      <div class="self-data">
        <div class="analysis-box">
          <div class="analysis-icon device">
            <i class="bx bxs-devices"></i>
          </div>
          <div class="analysis-container">
            <h3>Dispositivos</h3>
            <div class="analysis-content">
              <span>Total: <strong>${data?.devices?.length}</strong> c</span>
              <span><strong>${data.lastDevices}</strong> l <strong class="analysis-percent ${classFromPercent(data?.devices?.length, data.lastDevices)}">(${percentageMonthlyGrowth(data?.devices?.length, data.lastDevices)}) <i class='bx bxs-${classFromPercent(data?.devices?.length, data.lastDevices)}-circle' ></i></strong></span>
            </div>
          </div>
        </div>
        <div class="analysis-box">
          <div class="analysis-icon client">
            <i class="bx bx-user"></i>
          </div>
          <div class="analysis-container">
            <h3>Clientes</h3>
            <div class="analysis-content">
              <span>Total: <strong>${data?.clients?.length}</strong> c</span>
              <span><strong>${data.lastClients}</strong> l <strong class="analysis-percent ${classFromPercent(data?.clients?.length, data.lastClients)}">(${percentageMonthlyGrowth(data?.clients?.length, data.lastClients)}) <i class='bx bxs-${classFromPercent(data?.clients?.length, data.lastClients)}-circle' ></i></strong></span>
            </div>
          </div>
        </div>
        <div class="analysis-box">
          <div class="analysis-icon income">
            <i class='bx bx-dollar'></i>
          </div>
          <div class="analysis-container">
            <h3>Renda</h3>
            <div class="analysis-content">
              <span>Total: <strong>${simpleReal(data.income)}</strong> c</span>
              <span><strong>${simpleReal(data.incomeDifference.value)}</strong> l <strong class="analysis-percent ${classFromPercent(data.income, data.incomeDifference.value)}">(${percentageMonthlyGrowth(data.income, data.incomeDifference.value)}) <i class='bx bxs-${classFromPercent(data.income, data.incomeDifference.value)}-circle' ></i></strong></span>
            </div>
          </div>
        </div>
      </div>
      <div class="history-data">
        <div class="data" data-js="accordion">
          <div class="data-container" data-js="accordion-header" data-accordion-header="${new Date(data.updatedAt).getTime() * 60}">
            <button class="data-header" data-accordion-header="${new Date(data.updatedAt).getTime() * 60}">
              <span data-accordion-header="${new Date(data.updatedAt).getTime() * 60}">
                <i class="bx bx-user"></i>
                ${createTopData(data.devices, 'client')[0]}
              </span>
              <span data-accordion-header="${new Date(data.updatedAt).getTime() * 60}" data-count="${data.clients?.length}">
                <i class="bx bx-dollar"></i>
                ${simpleReal(createTopData(data.devices, 'client')[1])}
              </span>
              <span data-accordion-header="${new Date(data.updatedAt).getTime() * 60}" class="untreading">
                <i class="bx bxs-plus-circle"></i>
                ${simplePercent(data.income, createTopData(data.devices, 'client')[1])}
                <i class='bx bx-bar-chart'></i>
              </span>
            </button>
            <ul class="data-content" data-accordion-body="${new Date(data.updatedAt).getTime() * 60}">
              ${data.clients?.reduce((acc, cur) => acc += /* html */ `
                <li>
                  <span><i class='bx bx-chevron-right'></i> ${cur.name} ${cur.surname}</span>
                  <span>Whatsapp: ${cur.phone}</span>
                </li>
              ` ,'')}
            </ul>
          </div>
          <div class="data-container" data-js="accordion-header" data-accordion-header="${Math.floor(new Date(data.updatedAt).getTime() / 60)}">
            <button class="data-header" data-accordion-header="${Math.floor(new Date(data.updatedAt).getTime() / 60)}">
              <span data-accordion-header="${Math.floor(new Date(data.updatedAt).getTime() / 60)}">
                <i class="bx bx-devices"></i>
                ${createTopData(data.devices, 'device')[0]}
              </span>
              <span data-accordion-header="${Math.floor(new Date(data.updatedAt).getTime() / 60)}" data-count="${data.devices?.length}">
                <i class="bx bx-dollar"></i>
                ${simpleReal(createTopData(data.devices, 'device')[1])}
              </span>
              <span data-accordion-header="${Math.floor(new Date(data.updatedAt).getTime() / 60)}" class="untreading">
                <i class="bx bxs-plus-circle"></i>
                ${simplePercent(data.income, createTopData(data.devices, 'device')[1])}
                <i class='bx bx-bar-chart'></i>
              </span>
            </button>
            <ul class="data-content" data-accordion-body="${Math.floor(new Date(data.updatedAt).getTime() / 60)}">
              ${data.devices?.reduce((acc, cur) => acc += /* html */ `
                <li>
                  <span><i class='bx bx-chevron-right'></i> ${cur.brand} ${cur.model}</span>
                  <span>Cliente: ${cur.client.name}</span>
                </li>
              ` ,'')}
            </ul>
          </div>
        </div>
        <div class="uptrend">
          <div class="uptrend-title">
            <h3>${data?.topEmployer?.[0]}</h3>
            <span>Alto indice</span>
          </div>
          <div class="uptrend-level win">
            <span>${percentageMonthlyGrowth(data?.topEmployer?.[1], data.income)}</span>
            <i class='bx bx-trending-up' ></i>
          </div>
        </div>
      </div>
    </div>
  </div>
`