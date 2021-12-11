import uuidv4 from './uuid.js'

export function getCacheRepository (collection) {  
  let dataCache = JSON.parse(localStorage.getItem(collection)) || []
  function insert (data) {
    Object.assign(data, { id: uuidv4() })
    localStorage.setItem(collection, JSON.stringify([...dataCache, data]))
    return { id: data.id }
  }
  function find (params = {}, optional) {
    dataCache = JSON.parse(localStorage.getItem(collection)) || []
    const [key, value] = Object.entries(!optional ? params : optional)[0] || []
    let data = []
    dataCache = dataCache.filter(data => data[key] === value)
    if (typeof params === 'function') {
      data = dataCache.filter(params)
    }
    return data.length ? data : dataCache
  }
  function findOne (params) {
    dataCache = JSON.parse(localStorage.getItem(collection)) || []
    const [key, value] = Object.entries(params)[0] || []
    if (typeof params === 'function') {
      return dataCache.find(params)
    }
    return dataCache.find(data => data[key] === value)
  }
  function updateOne ({ id }, data) {
    dataCache = JSON.parse(localStorage.getItem(collection)) || []
    let isValid = undefined
    for (const i in dataCache) {
      if (dataCache[i].id === id) {
        Object.entries(data).forEach(([key, value]) => {
          dataCache[i][key] = value
        })
        dataCache[i].updatedAt = new Date()
        isValid = dataCache[i]
      }
    }
    localStorage.setItem(collection, JSON.stringify(dataCache))
    return isValid
  }
  function deleteOne (findParam) {
    dataCache = JSON.parse(localStorage.getItem(collection)) || []
    const id = typeof findParam === 'string' ? findParam : findParam.id
    const newData = dataCache.filter(data => data.id !== id)
    localStorage.setItem(collection, JSON.stringify(newData))
  }


  return { insert, find, findOne, updateOne, deleteOne }
}