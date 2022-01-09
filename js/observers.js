import { Subject } from './subject.js'
import { startStorage } from './post-request.js'
import { updateHistory } from './create-history.js'
import { firstAppointment, secondAppointment } from './generate-appointments.js'

const observerUpdateData = new Subject()
observerUpdateData.subscribe({ key: 'event-page', action: firstAppointment })
observerUpdateData.subscribe({ key: 'event-page', action: secondAppointment })
observerUpdateData.subscribe({ key: 'event-page', action: startStorage })
observerUpdateData.subscribe({ key: 'event-history', action: updateHistory })

export {
  observerUpdateData
}