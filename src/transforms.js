export function string(value) {
  return value == null ? value : String(value)
}

export function number(value) {
  return value == null ? value : Number(value)
}

export function integer(value, radix = 10) {
  return value == null ? value : parseInt(value, radix)
}

export function date(value) {
  return value == null ? value : (value instanceof Date ? value : new Date(value))
}
