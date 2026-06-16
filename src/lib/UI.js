import { onResize } from './Util'

class UI {
  btnLogo = document.getElementById('logo')
  btnContinue = document.getElementById('continue')
  winPause = document.getElementById('pause')

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
