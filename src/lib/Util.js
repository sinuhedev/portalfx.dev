const isMobile = () => window.matchMedia('(pointer: coarse)').matches

function onResize(callback) {
  const resize = () => {
    callback(isMobile())
  }
  resize()
  window.addEventListener('resize', resize)
}

export { isMobile, onResize }
