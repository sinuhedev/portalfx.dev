import { isMobile } from './Util'

class UI {
  btnLogo = document.getElementById('logo')
  btnContinue = document.getElementById('continue')
  winPause = document.getElementById('pause')

  constructor() {
    this.#resize()
  }

  #resize() {
    const onResize = () => {
      if (isMobile()) {
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
