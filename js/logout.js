import createElement from './create-element.js'

export default async function () {
  const logoutContainer = createElement({ element: 'div' })
  const span = createElement({ element: 'span' })
  const span1 = createElement({ element: 'span' })
  const span2 = createElement({ element: 'span' })
  const span3 = createElement({ element: 'span' })
  const loading = createElement({ element: 'div' })

  loading.append(span1, span2, span3)

  logoutContainer.className = 'logout-container'
  span.textContent = 'Saindo...'
  loading.className = 'loading'

  logoutContainer.append(span, loading)
  const root = document.querySelector('.root')
  root.append(logoutContainer)
  const startPromise = new Promise(resolve => {
    setTimeout(() => {
      logoutContainer.remove()
      resolve()
    }, 3000)
  })
  await startPromise
  const cookie = document.cookie.split("; ")
  for (const i in cookie) {
    document.cookie =/^[^=]+/.exec(cookie[i])[0]+"=;expires=Thu, 01 Jan 1970 00:00:00 GMT";    
  }
  window.location.replace('signin.html')
}
