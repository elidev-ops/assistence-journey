export function createData (data) {
  const elements = Array.from(data)
    .filter(elm => elm.tagName !== 'BUTTON')
    
  return elements.reduce(createObjectData, {})
}

function createObjectData (acc, { name, value }) {
  return { ...acc, [name]: value }
}