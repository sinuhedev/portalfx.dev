class GameUI {
  #BTN_LOGO = document.getElementById('logo')

  constructor() {
    this.#resize()
  }

  #resize() {
    const onResize = () => {
      const IS_MOBILE = window.matchMedia('(pointer: coarse)').matches

      if (IS_MOBILE) {
      } else {
      }
    }
    onResize()
    window.addEventListener('resize', onResize)
  }
}

export default GameUI
