class UI {
  btnLogo = document.getElementById('logo')
  btnContinue = document.getElementById('continue')
  winPause = document.getElementById('pause')

  constructor() {
    this.#resize()
  }

  #resize() {
    const onResize = () => {
      this.IS_MOBILE = window.matchMedia('(pointer: coarse)').matches

      if (this.IS_MOBILE) {
        this.btnLogo.style.display = 'block'
      } else {
        this.btnLogo.style.display = 'none'
      }
    }
    onResize()
    window.addEventListener('resize', onResize)
  }
}

export default UI
