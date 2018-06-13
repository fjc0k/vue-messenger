const cache = Object.create(null)

export default str => {
  if (!(str in cache)) {
    cache[str] = str.charAt(0).toUpperCase() + str.slice(1)
  }
  return cache[str]
}
