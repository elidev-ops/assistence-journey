export const deleteAndUpdate = (repository, fn, id) => ({
  update: () => { console.log('atualizar') },
  delete: () => {
    repository.deleteOne(id)
  }
})[fn]