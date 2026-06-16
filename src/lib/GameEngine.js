import { PerspectiveCamera, WebGLRenderer } from 'three'
import Input from './Input'
import UI from './UI'
import { log, onResize } from './Util'

class GameEngine {
  #animationId

  input

  canvas
  renderer
  camera

  constructor(canvas) {
    this.ui = new UI()
    this.input = new Input(canvas, this.ui)

    this.canvas = canvas
    this.renderer = new WebGLRenderer({ canvas })
    this.camera = new PerspectiveCamera(75, 1, 0.1, 2000)
  }

  async start() {
    await this.onInit()

    this.#resize()

    this.input.keyboard()
    this.input.gamepad()
    this.input.touchpad()
    this.input.buttons()

    let lastTime = 0
    const animate = (time) => {
      const delta = (time - lastTime) / 1000

      this.#animationId = window.requestAnimationFrame(animate)
      lastTime = time

      log({
        input: this.input
      })

      if (this.input.IS_PAUSE) return

      this.onAnimate(delta)
    }
    animate(0)

    this.#dispose()
  }

  #resize() {
    const width = this.canvas.style.width || '100%'
    const height = this.canvas.style.height || '100%'

    onResize(() => {
      this.canvas.style.width = width
      this.canvas.style.height = height

      const { clientWidth, clientHeight } = this.canvas
      this.renderer.setSize(clientWidth, clientHeight)
      this.camera.aspect = clientWidth / clientHeight
      this.camera.updateProjectionMatrix()
    })
  }

  #dispose() {
    window.addEventListener('beforeunload', () => {
      window.cancelAnimationFrame(this.#animationId)
      this.renderer.dispose()
      this.onDispose()
    })
  }

  async onInit() {}
  onAnimate(delta) {}
  onDispose() {}
}

export default GameEngine
