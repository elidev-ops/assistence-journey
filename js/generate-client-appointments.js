import { getCacheRepository } from './db.js'

const clientsRepo = getCacheRepository('clients')
const devicesRepo = getCacheRepository('devices')

export const firstAppointmentClients = () => {
  const clientsBox =
    clientsRepo
      .find()
      ?.reverse()
      ?.filter((_, index) => index <= 4)
      .reduce(
        (acc, cur) =>
          (acc += `
            <div class="client-box">
              <div class="appointment-icon">
                <i class="bx bxs-user"></i>
              </div>
              <strong class="name-client">${cur.name}</strong>
              <span>Novo</span>
            </div>
          `),
        ""
      ) || "Sem entradas de clientes"

  const firstAppointment = document.querySelector(".fist-appointment")
  firstAppointment.innerHTML = clientsBox
}

export const firstAppointmentDevices = () => {
  const devicesBox =
    devicesRepo
      .find()
      ?.reverse()
      ?.filter((_, index) => index <= 4)
      .reduce(
        (acc, cur) =>
          (acc += `
            <div class="client-box">
              <div class="appointment-icon">
                <i class="bx bxs-user"></i>
              </div>
              <strong class="name-client">${cur.model}</strong>
              <span>Novo</span>
            </div>
          `),
        ""
      ) || "Sem entradas de dispositivos"

  const firstAppointment = document.querySelector(".fist-appointment")
  firstAppointment.innerHTML = devicesBox
}
