export function sessionValidation () {
  const cookie = document.cookie
  const [page, _] = window.location.pathname.split('.')
  const session = page.slice(1, page.length)

  const sessions = (session) => ({
    signin: () => {
      if (cookie.length) window.location.replace('dashboard.html')
    },
    dashboard: () => {
      if (cookie.length) return
      window.location.replace('signin.html')
    }
  })[session]

  sessions(session)()
}
