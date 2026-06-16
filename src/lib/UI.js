import { isMobile, onResize } from './Util'

class UI {
  winPause = document.getElementById('win-pause')
  btnLogo = document.getElementById('btn-logo')
  btnContinue = document.getElementById('btn-continue')
  btnFullscreen = document.getElementById('btn-fullscreen')

  constructor() {
    this.#resize()
    this.#events()
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

  #events() {
    this.btnFullscreen.addEventListener('click', async () => {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen()
      } else {
        await document.exitFullscreen()
      }

      if ('orientation' in screen && isMobile()) {
        await screen.orientation.lock('landscape')
      }
    })
  }
}

export default UI
