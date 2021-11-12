export function msgErrorElement (className, message) {
  const msg = document.createElement('div')
  const span = document.createElement('span')

  msg.className = `msg ${className}`
  span.textContent = message
  msg.append(span)

  return msg
}

export function successElement (message) {
  const msg = document.createElement('div')
  const span = document.createElement('span')

  msg.className = 'success'
  span.textContent = message
  msg.append(span)

  return msg
}

export function saveMessage ({ msg, className }) {
  const div = document.createElement('div')
  const p = document.createElement('p')

  div.className = `message-box ${className}`
  p.textContent = msg
  div.appendChild(p)
  
  return div
}