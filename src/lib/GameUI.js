class GameUI {
  #BTN_LOGO = document.getElementById('logo')
  #BTN_CONTINUE = document.getElementById('continue')
  #UI_PAUSE = document.getElementById('pause')

  constructor() {
    this.#resize()
  }

  #resize() {
    const onResize = () => {
      const IS_MOBILE = window.matchMedia('(pointer: coarse)').matches

      if (IS_MOBILE) {
        this.#BTN_LOGO.style.display = 'block'
      } else {
        this.#BTN_LOGO.style.display = 'none'
      }
    }
    onResize()
    window.addEventListener('resize', onResize)
  }

  pause() {
    this.#UI_PAUSE.style.display = 'block'
    setTimeout(() => (this.#BTN_CONTINUE.disabled = false), 1000)
  }

  resume() {
    this.#UI_PAUSE.style.display = 'none'
  }

  onTouchpadEvents(pause, resume) {
    this.#BTN_LOGO.addEventListener('click', () => {
      this.#UI_PAUSE.style.display = 'block'
      pause()
    })

    this.#BTN_CONTINUE.addEventListener('click', () => {
      this.#UI_PAUSE.style.display = 'none'
      resume()
    })
  }
}

export default GameUI
