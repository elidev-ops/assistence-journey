import { updateHistory } from './create-history.js'
import { updateItem } from './update-item.js'
import { showDeviceContents, showClientContents } from './dashboard.js'
import { EventEmitter } from './emitter.js'

function updateDom () {
  const mainListContainer = document.querySelector('.main_list-container')
  showDeviceContents(mainListContainer)
  showClientContents(mainListContainer)
}
const emitter = new EventEmitter()
emitter.on('updateDom', updateDom)


export const deleteAndUpdate = (repository, fn, id) => ({
  update: () => new Promise(resolve => {
    document.querySelector('.update-item')?.remove()
    updateItem(repository, id, fn)
    resolve(true)
  }),
  delete: () => new Promise(resolve => {
    document.querySelector('.alert-box-container')?.remove()
    const [name, complement] = Object.values(repository.findOne({ params: { id }}))
    const $root = document.querySelector('#root')
    const $template = document.querySelector('#alert-layout')
    const alertBox = $template.content.cloneNode(true).children[0]
    const content = alertBox.querySelector('[data-alert-data]')
    content.textContent = `${name} ${complement}`
    $root.append(alertBox)
      alertBox.addEventListener('click', e => {
        if (e.target.dataset.alert) {
          if (JSON.parse(e.target.dataset.alert)) {
            repository.deleteOne(id)
            updateHistory()
            emitter.emit('updateDom')
          }
          alertBox.remove()
          resolve(true)
        }
      })
    resolve(false)
  })
})[fn] || null