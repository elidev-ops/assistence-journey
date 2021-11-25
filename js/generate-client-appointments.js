import { createNormalBadge } from './utils.js'

export const firstAppointment = (repo) => {
  const devicesBox =
    repo
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
              <strong class="name-client">${cur.model || cur.name}</strong>
              <span>Novo</span>
            </div>
          `),
        ''
      ) || 'Sem entradas de dispositivos'

  const firstAppointment = document.querySelector('.fist-appointment')
  firstAppointment.innerHTML = devicesBox
}

export const secondAppointment = (repo) => {
  const date = new Date()
  const date1 = new Date(date.getFullYear(), date.getMonth(), 0)

  const devicesDaily = repo.find().filter(device =>
    Intl.DateTimeFormat('pt-BR').format(new Date(device.createdAt)) ===
    Intl.DateTimeFormat('pt-BR').format(new Date())
  )
  const devicesWeek = repo.find().filter(device => {
    const deviceDate = new Date(device.createdAt)
    const dateNow = new Date()
    return deviceDate.getMonth() === dateNow.getMonth() 
      ? deviceDate.getDate() + 7 >= dateNow.getDate() ? device : '' : ''
  })
  const devicesMonth = repo.find().filter(device => {
    const deviceDate = new Date(device.createdAt)
    const dateNow = new Date()
    return deviceDate.getMonth() === dateNow.getMonth() ? device : ''
  })
  const devicesYear = repo.find().filter(device => {
    const deviceDate = new Date(device.createdAt)
    const dateNow = new Date()
    return deviceDate.getFullYear() === dateNow.getFullYear() ? device : ''
  })

  const percentDaily = isInt((devicesDaily.length * 100) / 5 * 1)
  const percentWeek = isInt((devicesWeek.length * 100) / (7 * 5))
  const percentMonth = isInt((devicesMonth.length * 100) / (5 * date1.getDate()))
  const percentYear = isInt((devicesYear.length * 100) / (5 * 365))

  const dailyHtml = /* html */ `
    <div class="container-box">
      <div class="appointment-icon">
        <i class="bx bxs-plane-alt"></i>
      </div>
      <div class="container-box_content">
        <div class="container-box_content--header">
          <strong>Relatório diário</strong>
          ${createNormalBadge(`${devicesDaily.length} / 5`)}
        </div>
        <div style="--w: ${percentDaily}%;" class="stats" data-stats="${percentDaily}%"></div>
      </div>
    </div>
  `
  const weekHtml = /* html */ `
    <div class="container-box">
      <div class="appointment-icon">
        <i class="bx bxs-car"></i>
      </div>
      <div class="container-box_content">
      <div class="container-box_content--header">
        <strong>Relatório semanal</strong>
          ${createNormalBadge(`${devicesWeek.length} / 35`)}
        </div>
        <div style="--w: ${percentWeek}%;" class="stats" data-stats="${percentWeek}%"></div>
      </div>
    </div>
  `
  const monthHtml = /* html */ `
    <div class="container-box">
      <div class="appointment-icon">
        <i class="bx bx-run"></i>
      </div>
      <div class="container-box_content">
        <div class="container-box_content--header">
          <strong>Relatório mensal</strong>
          ${createNormalBadge(`${devicesMonth.length} / ${(5 * date1.getDate())}`)}
        </div>
        <div style="--w: ${percentMonth}%;" class="stats" data-stats="${percentMonth}%"></div>
      </div>
    </div>
  `
  const yearHtml = /* html */ `
    <div class="container-box">
      <div class="appointment-icon">
        <i class="bx bx-walk"></i>
      </div>
      <div class="container-box_content">
        <div class="container-box_content--header">
          <strong>Relatório anual</strong>
          ${createNormalBadge(`${devicesYear.length} / ${5 * 365}`)}
        </div>
        <div style="--w: ${percentYear}%;" class="stats" data-stats="${percentYear}%"></div>
      </div>
    </div>
  `
  const secondAppointment = document.querySelector('.second-appointment')
  secondAppointment.innerHTML = dailyHtml
  secondAppointment.innerHTML += weekHtml
  secondAppointment.innerHTML += monthHtml
  secondAppointment.innerHTML += yearHtml
}

function isInt (number) {
  return number > 100 ? 100 : Number.isInteger(number) ? number : number.toFixed(1)
}