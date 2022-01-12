import { createData } from './create-data.js'
import { executeError } from './errors.js'
import { validationComposite, clientValidations, deviceValidations  } from './validation.js'
import { activeButtonSend } from './post-request.js'
import { showClientContents, showDeviceContents } from './dashboard.js'
import { observerUpdateData } from './observers.js'

const configForm = (from) => ({
  client: {
    message: 'Cliente atualizado com sucesso!',
    validation: (data) => clientValidations(data),
    action: showClientContents
  },
  device: {
    message: 'Dispositivo atualizado com sucesso!',
    validation: (data) => deviceValidations(data),
    action: showDeviceContents
  }
})[from] || 'err 400 - Algo de errado não esta certo'

export function updateItem(repository, id) {
  const item = repository.findOne({ params: { id } })
  delete item.updatedAt
  delete item.createdAt
  delete item.employee
  delete item.client
  delete item.status
  delete item.id

  const inputHtml = Object.entries(item)
    .reduce((acc, [key, value]) => acc += /* html */ `
      <div class="input-box">
        <input type="text" name="${key}" value="${value}" placeholder="${key}" />
      </div>
    `, '')

  const updateItemHtml = /* html */ `
  <div class="update-item">
  <header data-header-move="true">
    <h2 data-header-move="true">Editar ${item.name ? 'cliente' : 'dispositivo'}</h2>
    <div class="controls">
      <button data-controls="maximize" class="default">
        <i class="bx bx-expand"></i>
      </button>
      <button data-controls="close" class="default">
        <i class="bx bx-x"></i>
      </button>
    </div>
  </header>
  <form data-form="${item.name ? 'client' : 'device'}" class="update-item_container">
    ${inputHtml}
    <button class="btn save update"></button>
  </form>
  </div>`

  document.querySelector('#root').insertAdjacentHTML('beforeend', updateItemHtml)

  let drag, offset, expand = false
  let x, y, offsetY, offsetX = null
  const updateItemElm = document.querySelector('.update-item')

  function findPosition(elm) {
    if (elm) {
      offsetX = elm.offsetLeft
      offsetY = elm.offsetTop
    }
  }
  function startDrag(event) {
    if (event.target.dataset.headerMove) {
      drag = true
      offset = true
      updateItemElm.style.cursor = 'move'
      updateItemElm.style.opacity = 0.7
    }
  }
  function stopDrag() {
    drag = false
    offset = false
    updateItemElm.style.cursor = 'default'
    updateItemElm.style.opacity = 1
  }
  function moveCard(event) {
    if (!offset) {
      findPosition(updateItemElm)
      offsetX = x - offsetX
      offsetY = y - offsetY
    }
    x = event.clientX
    y = event.clientY
    if (drag) {
      updateItemElm.style.top = (y - offsetY) + 'px'
      updateItemElm.style.left = (x - offsetX) + 'px'
    }
  }
  updateItemElm.children[0].addEventListener('mousedown', startDrag)
  updateItemElm.children[0].addEventListener('mouseup', stopDrag)
  document.addEventListener('mousemove', moveCard)

  const controls = (control) => ({
    maximize: (elm) => {
      expand = !expand
      updateItemElm.classList.toggle('maximize')
      if (expand) {
        elm.children[0].className = 'bx bx-exit-fullscreen'
        updateItemElm.style.left = '0px'
        updateItemElm.style.top = '0px'
        return
      }
      elm.children[0].className = 'bx bx-expand'
      updateItemElm.style.top = '20%'
      updateItemElm.style.left = '30%'
    },
    close: () => {
      updateItemElm.remove()
    }
  })[control]
  clientValidations, deviceValidations 
  updateItemElm.addEventListener('click', e => {
    if (e.target.dataset.controls) {
      controls(e.target.dataset.controls)(e.target)
    }
  })
  updateItemElm.addEventListener('submit', async e => {
    e.preventDefault()
    const form = e.target
    const key = form.dataset.form
    const objectData = createData(form)
    const err = validationComposite(configForm(key).validation(objectData))

    if (err) {
      executeError(err)
      return
    }

    repository.updateOne(id, objectData)
    observerUpdateData.publisher('event-history')
    const buttonSaveElm = updateItemElm.querySelector('.btn')
    await activeButtonSend(buttonSaveElm)
    buttonSaveElm.classList.add('updated')
    configForm(key).action(document.querySelector('.main_list-container'))
    setTimeout(() => buttonSaveElm.classList.remove('updated'), 3000)
  })
}