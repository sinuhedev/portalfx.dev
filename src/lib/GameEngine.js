import { PerspectiveCamera, WebGLRenderer } from 'three'
import GameInput from './GameInput'
import GameUI from './GameUI'

class GameEngine {
  #animationId

  #ui = {
    winPause: null,
    btnContinue: null
  }

  input

  canvas
  renderer
  camera
  isMobile

  constructor(canvas) {
    this.input = new GameInput(canvas)
    this.ui = new GameUI()

    this.canvas = canvas
    this.renderer = new WebGLRenderer({ canvas })
    this.camera = new PerspectiveCamera(75, 1, 0.1, 1000)
  }

  async start() {
    await this.onInit()

    // this.#menu()
    this.#gui()
    this.#resize()

    this.input.keyboard()
    this.input.touchpad()
    this.input.gamepad()

    let lastTime = 0
    const animate = (time) => {
      const delta = (time - lastTime) / 1000

      this.#animationId = window.requestAnimationFrame(animate)
      lastTime = time

      this.#log({
        isMobile: this.isMobile,
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

    const onResize = () => {
      this.isMobile = window.matchMedia('(pointer: coarse)').matches

      this.canvas.style.width = width
      this.canvas.style.height = height

      const { clientWidth, clientHeight } = this.canvas
      this.renderer.setSize(clientWidth, clientHeight)
      this.camera.aspect = clientWidth / clientHeight
      this.camera.updateProjectionMatrix()
    }

    onResize()
    window.addEventListener('resize', onResize)
  }

  #menu() {
    const btnStart = document.getElementById('start')
    const winMenu = document.getElementById('menu')

    btnStart.addEventListener('click', async () => {
      // await document.documentElement.requestFullscreen()

      if (this.isMobile) {
        try {
          await screen.orientation.lock('landscape')
        } catch (err) {
          console.error(err)
        }
      } else {
        this.canvas.requestPointerLock()
      }

      winMenu.remove()
    })
  }

  #gui() {
    this.#ui.winPause = document.getElementById('pause')
    this.#ui.btnContinue = document.getElementById('continue')
    this.#ui.btnContinue.addEventListener('click', () => {
      this.canvas.requestPointerLock()
      this.#ui.winPause.style.display = 'none'
      this.input.resume()
    })

    const btnLogo = document.getElementById('logo')
    btnLogo.addEventListener('click', async () => {
      this.#ui.winPause.style.display = 'block'
      this.input.pause()

      this.#ui.btnContinue.disabled = true
      setTimeout(() => (this.#ui.btnContinue.disabled = false), 1000)
    })
  }

  #log(values) {
    document.getElementById('log-content').textContent = JSON.stringify(
      values,
      (_, value) =>
        typeof value === 'number' ? parseFloat(value.toFixed(3)) : value,
      2
    )
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
