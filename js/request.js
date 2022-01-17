export const api = (() => {
  return {
    get: async (url) => {
      const response = await fetch(url, {
        headers: { 'Accept': 'application/javascript' }
      })
      return response.headers
        .get('content-type')
        .includes('text/html') ?
        await response.text() : await response.json()
    },
    post: async (url, data) => await fetch(url, {
      method: 'POST',
      body: data
    })
  }
})()