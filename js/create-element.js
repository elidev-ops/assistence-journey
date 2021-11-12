export default function ({ element, attrs = {} }) {
  const elm = document.createElement(element)
  Object.entries(attrs).forEach(([key, value]) => {
    elm.setAttribute(key, value)
  })
  return elm
}
