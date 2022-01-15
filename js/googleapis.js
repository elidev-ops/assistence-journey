const apiUrl = 'https://www.googleapis.com/customsearch/v1?'
const queryParams  = new URLSearchParams({
  key: 'AIzaSyC-fMhWVCLp3GYtOYM5Fi8YFbbGGji23Q4',
  cx: '0ebe32fd940967965',
  imgSize: 'large',
  searchType: 'image',
  sort: 'review-rating:d:s'
})
const baseUrl = apiUrl + queryParams

export const googleapis = async (query) => {
  const response = await fetch(`${baseUrl}&q=${query}`)
  const json = await response.json()
  return json.items.map(data => ({
    url: data.link,
    mimeType: data.mime,
    title: data.title
  }))
}
