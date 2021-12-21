# assistence-journey
# seletor de cores para temas

# Sistema de notificações

# Informações do caixa
# Data do caixa status do caixa
# Total de entradas de clientes de 1000 
# Total de entradas de dispositivos de 1000
# Media de Valor R$ 200,00
# Você teve uma renda superior de R$ 100,00 em relação ao mes anterior Mar/2021.
# Valor bruto R$ 1.000,00
# Exibir lista de clientes
# Exibir lista de dispositivos


const defaultValue = { findParams: {}, order: undefined }
const orderOptions = (order) => ({ asc: 1, desc: -1 })[order] || 1

function orderBy (data, order) {
	return data.sort((x, y) => {
  	const firstValue = orderOptions(order.toLowerCase())
    const secondValue = firstValue > 0 ? -1 : 1
  	let a = x.name.toUpperCase()
    let b = y.name.toUpperCase()
    return a === b ? 0 : a > b ? firstValue : secondValue
  })
}

function db (repo) {
	this.dataCache = JSON.parse(localStorage.getItem(repo)) || []
	this.repo = repo
  
  const insert = (data) => {
    Object.assign(data, { id: uuidv4() })
    localStorage.setItem(this.repo, JSON.stringify([...this.dataCache, data]))
    return { id: data.id }
  } 

  const find = (callback = {}, { findParams, order } = defaultValue) => {
    this.dataCache = JSON.parse(localStorage.getItem(this.repo)) || []
    const [key, value] = Object.entries(
      callback.findParams ? callback.findParams : findParams || {})[0] || []
    this.dataCache = this.dataCache.filter(data => data[key] === value)
    if (typeof callback && callback instanceof Function) {
      this.dataCache = this.dataCache.filter(callback)
    }
    return callback.order 
      ? orderBy(this.dataCache, callback.order) : order 
      ? orderBy(this.dataCache, order) : this.dataCache
  }
  
  const findOne = (findParams) => {
  	this.dataCache = JSON.parse(localStorage.getItem(this.repo)) || []
    const [key, value] = Object.entries(findParams || {})[0] || []
    return findParams ? this.dataCache.find(data => data[key] === value) : {}
  }
  
  return {
  	insert,
    find,
    findOne
  }
}



const first = db('ttt')
console.log(first.find())
console.log(first.findOne())
