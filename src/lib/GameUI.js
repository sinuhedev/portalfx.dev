class GameUI extends EventTarget {
  #BTN_LOGO = document.getElementById('logo')
  #BTN_CONTINUE = document.getElementById('continue')
  #UI_PAUSE = document.getElementById('pause')

  constructor() {
    super()
    this.#resize()
    this.#events()
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

  #events() {
    this.#BTN_LOGO.addEventListener('click', () => {
      this.#UI_PAUSE.style.display = 'block'
      this.#BTN_CONTINUE.disabled = false

      this.dispatchEvent(new CustomEvent('pause', { detail: { pause: true } }))
    })

    this.#BTN_CONTINUE.addEventListener('click', () => {
      this.#UI_PAUSE.style.display = 'none'

      this.dispatchEvent(new CustomEvent('pause', { detail: { pause: false } }))
    })
  }

  pause() {
    this.#UI_PAUSE.style.display = 'block'
    this.#BTN_CONTINUE.disabled = true
    setTimeout(() => (this.#BTN_CONTINUE.disabled = false), 1000)
  }

  resume() {
    this.#UI_PAUSE.style.display = 'none'
  }
}

export default GameUI
