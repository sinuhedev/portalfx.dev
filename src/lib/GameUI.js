class GameUI {
  constructor() {
    this.#resize()
  }

  #resize() {
    const onResize = () => {
      const IS_MOBILE = window.matchMedia('(pointer: coarse)').matches
    }
    onResize()
    window.addEventListener('resize', onResize)
  }
}

export default GameUI
