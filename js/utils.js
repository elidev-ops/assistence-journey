export const createShortDate = (stringDate) => {
  const date = new Date(stringDate)
  const [day, month] = new Intl.DateTimeFormat('pt-br', { dateStyle: 'medium' })
    .format(date).split('.')[0].replace('de ', '').split(' ')
  return `${day.padStart(2, '0')} ${month.charAt(0).toUpperCase() + month.slice(1)}`
}

export const createDateBrazil = (date, type) => {
  return new Intl.DateTimeFormat('pt-br', { dateStyle: type, timeStyle: type }).format(new Date(date))
}

export const convertToReal = (value) => {
  return parseFloat(value).toLocaleString('pt-br', { style: 'currency', currency: 'BRL' })
}

export const simpleReal = (value) => 
  Number.isInteger(value) ? value + ',00' : parseFloat(value).toLocaleString('pt-BR')

export const shortUuidv4 = (value) => {
  return value.split('-')[0]
}

export const createNumberWhatsapp = (number) => {
  const phone = number.replace(/[()\- ]/g, '')
  const country = '+55'
  const ddd = phone.slice(0, 2)
  const numberNine = phone.slice(2, number.length).length < 9
    ? '9' : phone.slice(2, 3)
  const phoneNumber = phone.slice(2, number.length).length < 9
    ? phone.slice(2, 6) + '-' + phone.slice(6, 10)
    : phone.slice(3, 7) + '-' + phone.slice(7, 11)

  return `${country} ${ddd} ${numberNine} ${phoneNumber}`
}

export const createBadge = (data) => {
  const date = Intl.DateTimeFormat('pt-BR').format(new Date(data))
  const dateNow = Intl.DateTimeFormat('pt-BR').format(new Date())
  return date === dateNow ? /* html */
    `<span class="badge">
      Novo
    </span>`
    : ''
}

export const createNormalBadge = (value) => /* html */
  `<span class="badge">
      ${value}
  </span>`

export const percentageMonthlyGrowth = (current, last) => {
  const amountChange = current - last
  const measurement = amountChange / last
  return `${Math.ceil((Number.isFinite(measurement) ? measurement : 0) * 100)}%`
}

export const simplePercent = (first, second) => `${Math.round((second * 100) / first) || 0}%`