import { MathUtils, PerspectiveCamera, WebGLRenderer } from 'three'
import GameInput from './GameInput'
import GameUI from './GameUI'

class GameEngine extends GameInput {
  #animationId
  #inputKeys = {
    keyboard: {
      UP: 0,
      RIGHT: 0,
      DOWN: 0,
      LEFT: 0,
      SHIFT: 0
    },
    touchpad: {
      UP: 0,
      RIGHT: 0,
      DOWN: 0,
      LEFT: 0
    },
    gamepad: {
      UP: 0,
      RIGHT: 0,
      DOWN: 0,
      LEFT: 0,
      PAUSE_PRESSED: false
    }
  }
  #ui = {
    winPause: null,
    btnContinue: null
  }

  canvas
  renderer
  camera
  isMobile
  keys = {
    UP: 0,
    DOWN: 0,
    LEFT: 0,
    RIGHT: 0,
    IS_PAUSE: false,
    IS_MOVE: false,
    IS_RUN: false,
    AZIMUTH: 0, // angulo horizontal
    POLAR: MathUtils.degToRad(70), // angulo vertical,
    SENSITIVITY: 100,
    CAMERA_RADIUS: 3
  }

  constructor(canvas) {
    super()

    this.input = new GameInput()
    this.ui = new GameUI()

    this.canvas = canvas
    this.renderer = new WebGLRenderer({ canvas })
    this.camera = new PerspectiveCamera(75, 1, 0.1, 1000)
  }

  async start() {
    //  ignore events
    window.addEventListener('contextmenu', (e) => e.preventDefault())
    document.addEventListener('gesturestart', (e) => e.preventDefault())

    await this.onInit()

    // this.#menu()
    this.#gui()
    this.#resize()
    this.#keyboard()
    this.#touchpad()

    let lastTime = 0
    const animate = (time) => {
      const delta = (time - lastTime) / 1000

      this.#animationId = window.requestAnimationFrame(animate)
      lastTime = time

      this.#gamepad()

      this.#log({
        keys: this.keys,
        isMobile: this.isMobile,
        inputKeys: this.#inputKeys
      })

      if (this.keys.IS_PAUSE) return

      this.onAnimate(delta)
    }
    animate(0)

    this.#dispose()
  }

  #resize() {
    const width = this.canvas.style.width || '100%'
    const height = this.canvas.style.height || '100%'

    const onResize = () => {
      this.canvas.style.width = width
      this.canvas.style.height = height

      const { clientWidth, clientHeight } = this.canvas
      this.renderer.setSize(clientWidth, clientHeight)
      this.camera.aspect = clientWidth / clientHeight
      this.camera.updateProjectionMatrix()

      this.isMobile = window.matchMedia('(pointer: coarse)').matches

      if (this.isMobile) {
        this.keys.SENSITIVITY = 80
      } else {
        this.keys.SENSITIVITY = 800
      }
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
    this.#ui.btnContinue.addEventListener('click', () => this.#resume())

    const btnLogo = document.getElementById('logo')
    btnLogo.addEventListener('click', async () => {
      this.#pause()
    })
  }

  #keyboard() {
    // Key down and up
    const keyDownUpEventListener = (evt) => {
      const { code, type } = evt
      const keyType =
        type === 'keydown' ? 0.7 + this.#inputKeys.keyboard.SHIFT : 0

      switch (code) {
        case 'KeyW':
          this.#inputKeys.keyboard.UP = keyType
          break
        case 'KeyS':
          this.#inputKeys.keyboard.DOWN = keyType
          break
        case 'KeyA':
          this.#inputKeys.keyboard.LEFT = keyType
          break
        case 'KeyD':
          this.#inputKeys.keyboard.RIGHT = keyType
          break
        case 'ShiftLeft':
          this.#inputKeys.keyboard.SHIFT = type === 'keydown' ? 0.3 : 0
          break
      }

      this.#mergeInputs()
    }

    document.addEventListener('keydown', keyDownUpEventListener)
    document.addEventListener('keyup', keyDownUpEventListener)

    // mouse
    document.addEventListener('pointerdown', (evt) => {
      if (
        !this.keys.IS_PAUSE &&
        evt.target.tagName === 'CANVAS' &&
        evt.pointerType === 'mouse'
      )
        this.canvas.requestPointerLock()
    })

    document.addEventListener('mousemove', ({ movementX, movementY }) => {
      if (document.pointerLockElement === this.canvas) {
        this.keys.AZIMUTH -= movementX / this.keys.SENSITIVITY
        this.keys.POLAR -= movementY / this.keys.SENSITIVITY

        this.keys.POLAR = Math.max(
          MathUtils.degToRad(30),
          Math.min(MathUtils.degToRad(60), this.keys.POLAR)
        )
      }
    })

    document.addEventListener('pointerlockchange', () => {
      if (document.pointerLockElement === null && !this.keys.IS_PAUSE) {
        this.#pause()
      }
    })
  }

  #touchpad() {
    const pointers = new Map()

    this.canvas.style.touchAction = 'none'

    const recalculate = () => {
      this.#inputKeys.touchpad.LEFT = 0
      this.#inputKeys.touchpad.RIGHT = 0
      this.#inputKeys.touchpad.UP = 0
      this.#inputKeys.touchpad.DOWN = 0

      for (const [, pointer] of pointers) {
        if (pointer.side !== 'left') continue

        this.#inputKeys.touchpad.LEFT += pointer.LEFT ?? 0
        this.#inputKeys.touchpad.RIGHT += pointer.RIGHT ?? 0
        this.#inputKeys.touchpad.UP += pointer.UP ?? 0
        this.#inputKeys.touchpad.DOWN += pointer.DOWN ?? 0
      }

      this.#mergeInputs()
    }

    this.canvas.addEventListener('pointerdown', (e) => {
      if (e.pointerType !== 'touch') return

      pointers.set(e.pointerId, {
        x: e.clientX,
        y: e.clientY,
        side: e.clientX < window.innerWidth / 2 ? 'left' : 'right',
        LEFT: 0,
        RIGHT: 0,
        UP: 0,
        DOWN: 0
      })
    })

    this.canvas.addEventListener('pointermove', (e) => {
      if (e.pointerType !== 'touch') return

      const origin = pointers.get(e.pointerId)
      if (!origin) return

      const dx = e.clientX - origin.x
      const dy = e.clientY - origin.y

      if (origin.side === 'left') {
        const angle = Math.atan2(dy, dx)
        const distance = Math.sqrt(dx * dx + dy * dy)

        const MOVE = distance > 5 ? 0.7 : 0
        const RUN = distance > 40 ? 0.3 : 0

        origin.UP = angle > -2.36 && angle < -0.79 ? MOVE + RUN : 0
        origin.RIGHT = angle > -1.18 && angle < 1.18 ? MOVE + RUN : 0
        origin.DOWN = angle > 0.79 && angle < 2.36 ? MOVE + RUN : 0
        origin.LEFT = Math.abs(angle) > 1.96 ? MOVE + RUN : 0
      } else {
        this.keys.AZIMUTH -= e.movementX / this.keys.SENSITIVITY
        this.keys.POLAR -= e.movementY / this.keys.SENSITIVITY

        this.keys.POLAR = Math.max(
          MathUtils.degToRad(30),
          Math.min(MathUtils.degToRad(60), this.keys.POLAR)
        )

        origin.x = e.clientX
        origin.y = e.clientY
      }

      recalculate()
    })

    this.canvas.addEventListener('pointerup', (e) => {
      if (e.pointerType !== 'touch') return

      pointers.delete(e.pointerId)
      recalculate()
    })

    this.canvas.addEventListener('pointercancel', (e) => {
      if (e.pointerType !== 'touch') return

      pointers.delete(e.pointerId)
      recalculate()
    })
  }

  // index = 0
  // wasPressed = false
  #gamepad() {
    const gamepad = navigator.getGamepads()[0]
    if (!gamepad) return

    /**
     * Pause
     */
    const PAUSE = gamepad.buttons[16].pressed

    if (PAUSE && !this.#inputKeys.gamepad.PAUSE_PRESSED) {
      this.#inputKeys.gamepad.PAUSE_PRESSED = true

      if (this.keys.IS_PAUSE) this.#resume()
      else this.#pause()
    }
    if (!PAUSE) {
      this.#inputKeys.gamepad.PAUSE_PRESSED = false
    }

    /**
     * Inputs
     */
    if (!this.keys.IS_PAUSE) {
      // Sticks — umbral para evitar drift
      const DEAD_ZONE = 0.1
      const lx = Math.abs(gamepad.axes[0]) > DEAD_ZONE ? gamepad.axes[0] : 0
      const ly = Math.abs(gamepad.axes[1]) > DEAD_ZONE ? gamepad.axes[1] : 0
      const rx = Math.abs(gamepad.axes[2]) > DEAD_ZONE ? gamepad.axes[2] : 0
      const ry = Math.abs(gamepad.axes[3]) > DEAD_ZONE ? gamepad.axes[3] : 0

      // Movimiento (stick izquierdo)
      this.#inputKeys.gamepad.LEFT = lx < 0 ? -lx : 0
      this.#inputKeys.gamepad.RIGHT = lx > 0 ? lx : 0
      this.#inputKeys.gamepad.UP = ly < 0 ? -ly : 0
      this.#inputKeys.gamepad.DOWN = ly > 0 ? ly : 0

      // Cámara (stick derecho)
      this.keys.AZIMUTH -= rx * 0.05
      this.keys.POLAR -= ry * 0.05
      this.keys.POLAR = Math.max(
        MathUtils.degToRad(30),
        Math.min(MathUtils.degToRad(60), this.keys.POLAR)
      )
    }

    // const focusable = [...document.querySelectorAll('button')]
    // // const current = document.activeElement
    // // const index = focusable.indexOf(current)

    // const down = gamepad.buttons[13].pressed
    // const up = gamepad.buttons[12].pressed

    // if (down && !this.wasPressed) {
    //   this.index += 1
    // }
    // this.wasPressed = down

    // focusable[this.index].focus({ focusVisible: true })

    this.#mergeInputs()
  }

  #mergeInputs() {
    const { keyboard: kb, touchpad: tp, gamepad: gp } = this.#inputKeys
    const keys = this.keys

    keys.UP = Math.max(kb.UP, tp.UP, gp.UP)
    keys.DOWN = Math.max(kb.DOWN, tp.DOWN, gp.DOWN)
    keys.LEFT = Math.max(kb.LEFT, tp.LEFT, gp.LEFT)
    keys.RIGHT = Math.max(kb.RIGHT, tp.RIGHT, gp.RIGHT)

    const max = Math.max(keys.UP, keys.DOWN, keys.LEFT, keys.RIGHT)
    keys.IS_MOVE = max > 0.3
    keys.IS_RUN = max > 0.7
  }

  #pause() {
    this.#ui.winPause.style.display = 'block'
    this.keys.IS_PAUSE = true

    this.#ui.btnContinue.disabled = true
    setTimeout(() => (this.#ui.btnContinue.disabled = false), 1000)
  }

  #resume() {
    this.canvas.requestPointerLock()
    this.#ui.winPause.style.display = 'none'
    this.keys.IS_PAUSE = false
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
