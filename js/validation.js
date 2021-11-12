import { CustomError } from './errors.js'

export function validationComposite (validations) {
  for (const validation of validations) {
    if (validation) {
      return validation
    }
  }
}

export function signupValidations (inputs) {
  const validations = []
  for (const input in inputs) {
    if (inputs[input].trim() === '') {
      validations.push(new CustomError(`O campo ${input} é obrigatório.`, input))
    }
  }
  if (inputs['password'] !== inputs['passwordConfirmation']) {
    validations.push(new CustomError(`A confirmação de senha esta diferente.`, 'passwordConfirmation'))
  }
  if (!/(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/.test(inputs['email'])) {
    validations.push(new CustomError('Email esta incorreto.', 'email'))
  }
  return validations
}

export function clientValidations (inputs) {
  const validations = []
  for (const input in inputs) {
    if (inputs[input].trim() === '') {
      validations.push(new CustomError(`O campo ${input} é obrigatório.`, input))
    }
  }
  if (!/(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/.test(inputs['email'])) {
    validations.push(new CustomError('Email esta incorreto.', 'email'))
  }
  return validations
}

export function deviceValidations (inputs) {
  const validations = []
  for (const input in inputs) {
    if (inputs[input].trim() === '') {
      validations.push(new CustomError(`O campo ${input} é obrigatório.`, input))
    }
  }
  return validations
}

export function signinValidations (inputs) {
  const validations = []
  for (const input in inputs) {
    if (inputs[input].trim() === '') {
      validations.push(new CustomError(`O campo ${input} é obrigatório.`, input))
    }
  }
  return validations
}
