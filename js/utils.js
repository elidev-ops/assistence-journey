export const createShortDate = (stringDate) => {
  const date = new Date(stringDate)
  const intlDate = new Intl.DateTimeFormat('pt-br', { dateStyle: 'medium' })
    .format(date).split('.')[0].replace('de ', '')
  return intlDate.slice(0, 3) + intlDate.charAt(3).toUpperCase() + intlDate.slice(4)
}

export const createDateBrazil = (date, type) => {
  return new Intl.DateTimeFormat('pt-br', { dateStyle: type, timeStyle: type }).format(new Date(date))
}

export const convertToReal = (value) => {
  return parseFloat(value).toLocaleString('pt-br', { style: 'currency', currency: 'BRL' })
}