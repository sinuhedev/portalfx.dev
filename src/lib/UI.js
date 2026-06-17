import { isMobile, onResize, storage } from './Util'

class UI {
  winPause = document.getElementById('win-pause')
  winLog = document.getElementById('win-log')
  //
  btnLogo = document.getElementById('btn-logo')
  btnContinue = document.getElementById('btn-continue')
  btnFullscreen = document.getElementById('btn-fullscreen')
  btnDebug = document.getElementById('btn-debug')

  constructor() {
    this.#init()
    this.#resize()
    this.#events()
  }

  #init() {
    this.winLog.style.display = storage('log') ? 'block' : 'none'
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

    this.btnDebug.addEventListener('click', () => {
      storage('log', !storage('log'))

      this.winLog.style.display = storage('log') ? 'block' : 'none'
    })
  }
}

export default UI
