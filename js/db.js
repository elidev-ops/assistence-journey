import uuidv4 from './uuid.js'

export function getCacheRepository (collection) {
  const dataCache = JSON.parse(localStorage.getItem(collection)) || []
  
  function insert (data) {
    Object.assign(data, { id: uuidv4() })
    localStorage.setItem(collection, JSON.stringify([...dataCache, data]))
    return { id: data.id }
  }
  function find (params = {}) {
    const [key, value] = Object.entries(params) || []
    const data =  dataCache.filter(data => data[key] === value)
    return data.length ? data : dataCache
  }
  function findOne (params) {
    const [key, value] = Object.entries(params) || []
    return dataCache.find(data => data[key] === value)
  }
  function updateOne ({ id }, data) {
    let isValid = undefined
    for (const i in dataCache) {
      if (dataCache[i].id === id) {
        Object.entries(data).forEach(([key, value]) => {
          dataCache[i][key] = value
        })
        isValid = dataCache[i]
      }
    }
    localStorage.setItem(collection, JSON.stringify(dataCache))
    return isValid
  }
  function deleteOne (findParam) {
    const id = typeof findParam === 'string' ? findParam : findParam.id
    const newData = dataCache.filter(data => data.id !== id)
    localStorage.setItem(collection, JSON.stringify(newData))
  }


  return { insert, find, findOne, updateOne, deleteOne }
}