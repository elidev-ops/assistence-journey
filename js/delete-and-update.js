import { updateHistory } from './create-history.js'
import { updateItem } from './update-item.js'


export const deleteAndUpdate = (repository, fn, id) => ({
  update: () => {
    document.querySelector('.update-item')?.remove()
    updateItem(repository, id, fn)
  },
  delete: () => {
    repository.deleteOne(id)
    updateHistory()
  }
})[fn]