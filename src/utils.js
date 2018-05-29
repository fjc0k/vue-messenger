import * as transforms from './transforms'

const cache = Object.create(null)

export function isFunction(fn) {
  return typeof fn === 'function'
}

export function upperCaseFirst(str) {
  if (str in cache) return cache[str]

  cache[str] = str[0].toUpperCase() + str.slice(1)

  return cache[str]
}

const transformCache = Object.create(null)

export function transform(literal) {
  if (!(literal in transformCache)) {
    let transformName
    let args
    if (Array.isArray(literal)) {
      [transformName, ...args] = literal
    } else {
      transformName = literal
      args = []
    }
    transformCache[literal] = transforms[transformName] ?
      value => transforms[transformName].apply(null, [value, ...args]) :
      value => value
  }
  return transformCache[literal]
}
