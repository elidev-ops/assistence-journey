import uuidv4 from './uuid.js'

const defaultValue = { params: {}, order: undefined }
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

export function getCacheRepository (repo) {
	let dataCache = JSON.parse(localStorage.getItem(repo)) || []
  
  const insert = (data) => {
    dataCache = JSON.parse(localStorage.getItem(repo)) || []
    Object.assign(data, { id: uuidv4() })
    localStorage.setItem(repo, JSON.stringify([...dataCache, data]))
    return { id: data.id }
  } 

  const find = (callback = {}, { params, order } = defaultValue) => {
    dataCache = JSON.parse(localStorage.getItem(repo)) || []
    const [key, value] = Object.entries(
      callback.params ? callback.params : params || {})[0] || []
    dataCache = dataCache.filter(data => data[key] === value)
    if (typeof callback && callback instanceof Function) {
      dataCache = dataCache.filter(callback)
    }
    // console.log(dataCache, callback, callback.order)
    return callback.order 
      ? orderBy(dataCache, callback.order) : order 
      ? orderBy(dataCache, order) : dataCache.sort((a, b) =>
        new Date(a.updatedAt).getTime() < new Date(b.updatedAt).getTime())
  }
  
  const findOne = (callback = {}, { params } = {}) => {
  	dataCache = JSON.parse(localStorage.getItem(repo)) || []
    const [key, value] = Object.entries(
      callback.params ? callback.params : params || {})[0] || []
    if (typeof callback && callback instanceof Function) {
      dataCache =  dataCache.filter(callback)
    }
    dataCache = dataCache.find(data => data[key] === value)
    return callback || params ? dataCache : {}
  }
  
  const updateOne = (updateParams, data) => {
  	dataCache = JSON.parse(localStorage.getItem(repo)) || []
    let isValid
    const id = updateParams.id || updateParams
    for (const i in dataCache) {
    	if (dataCache[i].id === id) {
      	Object.entries(data).forEach(([key, value]) => {
        	dataCache[i][key] = value
        })
        dataCache[i].updatedAt = new Date()
        isValid = dataCache[i]
      }
    }
    localStorage.setItem(repo, JSON.stringify(dataCache))
    return isValid
  }
  
  const deleteOne = (deleteParams) => {
  	dataCache = JSON.parse(localStorage.getItem(repo)) || []
    const id = deleteParams.id || deleteParams
    const filterData = dataCache.filter(data => data.id !== id)
    localStorage.setItem(repo, JSON.stringify(filterData))
  }
  
  return {
  	insert,
    find,
    findOne,
    updateOne,
    deleteOne
  }
}