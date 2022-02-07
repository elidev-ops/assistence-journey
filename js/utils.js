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
  const dateNowModifier = new Date(data)
  const date = new Date(
    dateNowModifier.getFullYear(),
    dateNowModifier.getMonth(),
    dateNowModifier.getDate() + 7).getTime()
  const dateNow = new Date().getTime()
      
  return date >= dateNow ? /* html */
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

export const formatRealInK = value => {
  if (value.toString().length >= 4) {
    return Math.floor(value / 1000) + 'K'
  }
  return value
}

export const convertRealValueOutput = (input) => {
	let value = input.value

  value = parseInt(value.replace(/[\D]+/g, ''))
  value = (value / 100).toFixed(2) + ''
  value = value.replace('.', ',')
  value = value.replace(/(\d)(\d{3})(\d{3}),/g, '$1.$2.$3,')
  value = value.replace(/(\d)(\d{3}),/g, '$1.$2,')
  
  input.value = value
  if (value === 'NaN') input.value = ''
}


export const nFormatter = (num, digits) => {
  const lookup = [
    { value: 1, symbol: ''},
    { value: 1e3, symbol: 'K'},
    { value: 1e6, symbol: 'M'},
    { value: 1e9, symbol: 'G'},
    { value: 1e12, symbol: 'T'},
  ]
  const regex = /\.0+$|(\.[0-9]*[1-9])0+$/
  let item = lookup.slice().reverse().find(item => num >= item.value)
  return item ? (num / item.value).toFixed(digits).replace(regex, "$1") + item.symbol : '0'
}