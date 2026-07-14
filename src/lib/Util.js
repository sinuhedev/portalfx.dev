const isMobile = () => window.matchMedia('(pointer: coarse)').matches

function onResize(callback) {
  const resize = () => {
    callback(isMobile())
  }
  resize()
  window.addEventListener('resize', resize)
}

function log(values) {
  const winLog = document.querySelector('#win-log pre')

  winLog.textContent = JSON.stringify(
    values,
    (_, value) =>
      typeof value === 'number' ? parseFloat(value.toFixed(3)) : value,
    2
  )
}

function storage(key, value) {
  // setItem
  if (value !== undefined) return localStorage.setItem(key, value)

  // getItem
  const val = window.localStorage.getItem(key) || ''

  // boolean
  if (val === 'true' || val === 'false') return val === 'true'

  // number
  if (val.trim() !== '' && !Number.isNaN(Number(val))) return Number(val)

  return val
}

export { isMobile, log, onResize, storage }
