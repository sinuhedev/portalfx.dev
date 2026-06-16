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

export { isMobile, log, onResize }
