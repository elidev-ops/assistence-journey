export const api = (() => {
  return {
    get: async (url) => await fetch(url),
    post: async (url, data) => await fetch(url, data)
  }
})()