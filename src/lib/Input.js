import { MathUtils } from 'three'
import { isMobile, onResize } from './Util'

class Input {
  UP = 0
  DOWN = 0
  LEFT = 0
  RIGHT = 0
  IS_PAUSE = false
  IS_MOVE = false
  IS_RUN = false
  AZIMUTH = 0 // angulo horizontal
  POLAR = MathUtils.degToRad(70) // angulo vertical
  SENSITIVITY = 0
  CAMERA_RADIUS = 3
  KEYBOARD = {
    UP: 0,
    RIGHT: 0,
    DOWN: 0,
    LEFT: 0,
    SHIFT: 0
  }
  TOUCHPAD = {
    UP: 0,
    RIGHT: 0,
    DOWN: 0,
    LEFT: 0
  }
  GAMEPAD = {
    UP: 0,
    RIGHT: 0,
    DOWN: 0,
    LEFT: 0,
    PAUSE_PRESSED: false
  }

  #canvas
  #ui

  constructor(canvas, ui) {
    this.#canvas = canvas
    this.#ui = ui

    this.#resize()

    // ignoreEvents
    window.addEventListener('contextmenu', (e) => e.preventDefault())
    document.addEventListener('gesturestart', (e) => e.preventDefault())
  }

  #resize() {
    onResize((isMobile) => {
      if (isMobile) {
        this.SENSITIVITY = 80
      } else {
        this.SENSITIVITY = 800
      }
    })
  }

  keyboard() {
    // Key down and up
    const keyDownUpEventListener = (evt) => {
      const { code, type } = evt
      const keyType = type === 'keydown' ? 0.7 + this.KEYBOARD.SHIFT : 0

      switch (code) {
        case 'KeyW':
          this.KEYBOARD.UP = keyType
          break
        case 'KeyS':
          this.KEYBOARD.DOWN = keyType
          break
        case 'KeyA':
          this.KEYBOARD.LEFT = keyType
          break
        case 'KeyD':
          this.KEYBOARD.RIGHT = keyType
          break
        case 'ShiftLeft':
          this.KEYBOARD.SHIFT = type === 'keydown' ? 0.3 : 0
          break
      }

      this.#mergeInputs()
    }

    document.addEventListener('keydown', keyDownUpEventListener)
    document.addEventListener('keyup', keyDownUpEventListener)

    // mouse
    document.addEventListener('pointerdown', (evt) => {
      if (evt.target.tagName === 'CANVAS' && evt.pointerType === 'mouse')
        this.#canvas.requestPointerLock()
    })

    document.addEventListener('mousemove', ({ movementX, movementY }) => {
      if (document.pointerLockElement === this.#canvas) {
        this.AZIMUTH -= movementX / this.SENSITIVITY
        this.POLAR -= movementY / this.SENSITIVITY

        this.POLAR = Math.max(
          MathUtils.degToRad(30),
          Math.min(MathUtils.degToRad(60), this.POLAR)
        )
      }
    })

    document.addEventListener('pointerlockchange', () => {
      if (document.pointerLockElement !== this.#canvas) {
        this.IS_PAUSE = true

        this.#ui.winPause.style.display = 'block'
        this.#ui.btnContinue.disabled = true
        setTimeout(() => (this.#ui.btnContinue.disabled = false), 1000)
      }
    })
  }

  touchpad() {
    const pointers = new Map()

    this.#canvas.style.touchAction = 'none'

    const recalculate = () => {
      this.TOUCHPAD.LEFT = 0
      this.TOUCHPAD.RIGHT = 0
      this.TOUCHPAD.UP = 0
      this.TOUCHPAD.DOWN = 0

      for (const [, pointer] of pointers) {
        if (pointer.side !== 'left') continue

        this.TOUCHPAD.LEFT += pointer.LEFT ?? 0
        this.TOUCHPAD.RIGHT += pointer.RIGHT ?? 0
        this.TOUCHPAD.UP += pointer.UP ?? 0
        this.TOUCHPAD.DOWN += pointer.DOWN ?? 0
      }

      this.#mergeInputs()
    }

    this.#canvas.addEventListener('pointerdown', (e) => {
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

    this.#canvas.addEventListener('pointermove', (e) => {
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
        this.AZIMUTH -= e.movementX / this.SENSITIVITY
        this.POLAR -= e.movementY / this.SENSITIVITY

        this.POLAR = Math.max(
          MathUtils.degToRad(30),
          Math.min(MathUtils.degToRad(60), this.POLAR)
        )

        origin.x = e.clientX
        origin.y = e.clientY
      }

      recalculate()
    })

    this.#canvas.addEventListener('pointerup', (e) => {
      if (e.pointerType !== 'touch') return

      pointers.delete(e.pointerId)
      recalculate()
    })

    this.#canvas.addEventListener('pointercancel', (e) => {
      if (e.pointerType !== 'touch') return

      pointers.delete(e.pointerId)
      recalculate()
    })
  }

  gamepad() {
    const gamepadLoop = () => {
      window.requestAnimationFrame(gamepadLoop)

      const gamepad = navigator.getGamepads()[0]
      if (!gamepad) return

      /**
       * Buttons
       */
      const PAUSE = gamepad.buttons[16].pressed

      /**
       * Pause
       */

      if (PAUSE) {
        if (!this.GAMEPAD.PAUSE_PRESSED) {
          if (this.IS_PAUSE) {
            this.#ui.winPause.style.display = 'none'
          } else {
            this.#ui.winPause.style.display = 'block'
            this.#ui.btnContinue.disabled = true
            setTimeout(() => (this.#ui.btnContinue.disabled = false), 1000)
          }

          this.IS_PAUSE = !this.IS_PAUSE
          this.GAMEPAD.PAUSE_PRESSED = true
        }
      } else this.GAMEPAD.PAUSE_PRESSED = false

      if (this.IS_PAUSE) return

      /**
       * Inputs
       */

      // Sticks — umbral para evitar drift
      const DEAD_ZONE = 0.1
      const lx = Math.abs(gamepad.axes[0]) > DEAD_ZONE ? gamepad.axes[0] : 0
      const ly = Math.abs(gamepad.axes[1]) > DEAD_ZONE ? gamepad.axes[1] : 0
      const rx = Math.abs(gamepad.axes[2]) > DEAD_ZONE ? gamepad.axes[2] : 0
      const ry = Math.abs(gamepad.axes[3]) > DEAD_ZONE ? gamepad.axes[3] : 0

      // Movimiento (stick izquierdo)
      this.GAMEPAD.LEFT = lx < 0 ? -lx : 0
      this.GAMEPAD.RIGHT = lx > 0 ? lx : 0
      this.GAMEPAD.UP = ly < 0 ? -ly : 0
      this.GAMEPAD.DOWN = ly > 0 ? ly : 0

      // Cámara (stick derecho)
      this.AZIMUTH -= rx * 0.05
      this.POLAR -= ry * 0.05
      this.POLAR = Math.max(
        MathUtils.degToRad(30),
        Math.min(MathUtils.degToRad(60), this.POLAR)
      )

      this.#mergeInputs()
    }

    gamepadLoop()
  }

  buttons() {
    this.#ui.btnLogo.addEventListener('click', () => {
      this.#ui.winPause.style.display = 'block'
      this.#ui.btnContinue.disabled = false
      this.IS_PAUSE = true
    })

    this.#ui.btnContinue.addEventListener('click', () => {
      this.#ui.winPause.style.display = 'none'
      this.IS_PAUSE = false

      if (!isMobile()) this.#canvas.requestPointerLock()
    })
  }

  #mergeInputs() {
    this.UP = Math.max(this.KEYBOARD.UP, this.TOUCHPAD.UP, this.GAMEPAD.UP)
    this.DOWN = Math.max(
      this.KEYBOARD.DOWN,
      this.TOUCHPAD.DOWN,
      this.GAMEPAD.DOWN
    )
    this.LEFT = Math.max(
      this.KEYBOARD.LEFT,
      this.TOUCHPAD.LEFT,
      this.GAMEPAD.LEFT
    )
    this.RIGHT = Math.max(
      this.KEYBOARD.RIGHT,
      this.TOUCHPAD.RIGHT,
      this.GAMEPAD.RIGHT
    )

    const max = Math.max(this.UP, this.DOWN, this.LEFT, this.RIGHT)
    this.IS_MOVE = max > 0.3
    this.IS_RUN = max > 0.7
  }
}

export default Input
