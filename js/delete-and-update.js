import { updateHistory } from './create-history.js'

export const deleteAndUpdate = (repository, fn, id) => ({
  update: () => { console.log('atualizar') },
  delete: () => {
    repository.deleteOne(id)
    updateHistory()
  }
})[fn]