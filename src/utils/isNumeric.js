// https://github.com/jquery/jquery/blob/master/src/deprecated.js#L84

export default value => {
  const type = typeof value
  return (type === 'number' || type === 'string') && (
    !isNaN(value - parseFloat(value))
  )
}
