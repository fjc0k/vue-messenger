const cache = Object.create(null)

export function isFunction(fn) {
  return typeof fn === 'function'
}

export function upperCaseFirst(str) {
  if (str in cache) return cache[str]

  cache[str] = str[0].toUpperCase() + str.slice(1)

  return cache[str]
}

export function shallowCopy(value) {
  return Array.isArray(value) ? value.slice() : value
}
