import { getCacheRepository } from './db.js'

const clientsRepo = getCacheRepository('clients')

export const firstAppointment = () => {
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
