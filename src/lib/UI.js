import { onResize } from './Util'

class UI {
  winPause = document.getElementById('win-pause')
  btnLogo = document.getElementById('btn-logo')
  btnContinue = document.getElementById('btn-continue')

  constructor() {
    this.#resize()
  }

  #resize() {
    onResize((isMobile) => {
      if (isMobile) {
        this.btnLogo.style.display = 'block'
      } else {
        this.btnLogo.style.display = 'none'
      }
    })
  }
}

export default UI
