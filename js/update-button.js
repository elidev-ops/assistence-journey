import createElement from './create-element.js'

export const updateButton = () => {
  const button = createElement({ element: 'button' })
  const i = createElement({ element: 'i' })

  button.className = 'update'
  i.className = 'bx bx-refresh'

  button.append(i)
  return button
}