import { MathUtils } from 'three'

class GameInput {
  UP = 0
  DOWN = 0
  LEFT = 0
  RIGHT = 0
  IS_MOBILE = false
  IS_PAUSE = false
  IS_MOVE = false
  IS_RUN = false
  AZIMUTH = 0 // angulo horizontal
  POLAR = MathUtils.degToRad(70) // angulo vertical
  SENSITIVITY = 0
  CAMERA_RADIUS = 3

  #BTN_LOGO = document.getElementById('logo')
  #BTN_CONTINUE = document.getElementById('continue')
  #UI_PAUSE = document.getElementById('pause')

  #canvas

  #keyboard = {
    UP: 0,
    RIGHT: 0,
    DOWN: 0,
    LEFT: 0,
    SHIFT: 0
  }
  #touchpad = {
    UP: 0,
    RIGHT: 0,
    DOWN: 0,
    LEFT: 0
  }
  #gamepad = {
    UP: 0,
    RIGHT: 0,
    DOWN: 0,
    LEFT: 0,
    PAUSE_PRESSED: false
  }

  constructor(canvas) {
    this.#canvas = canvas
    this.#resize()

    // ignoreEvents
    window.addEventListener('contextmenu', (e) => e.preventDefault())
    document.addEventListener('gesturestart', (e) => e.preventDefault())
  }

  #resize() {
    const onResize = () => {
      this.IS_MOBILE = window.matchMedia('(pointer: coarse)').matches

      if (this.IS_MOBILE) {
        this.SENSITIVITY = 80
        this.#BTN_LOGO.style.display = 'block'
      } else {
        this.SENSITIVITY = 800
        this.#BTN_LOGO.style.display = 'none'
      }
    }
    onResize()
    window.addEventListener('resize', onResize)
  }

  keyboard() {
    // Key down and up
    const keyDownUpEventListener = (evt) => {
      const { code, type } = evt
      const keyType = type === 'keydown' ? 0.7 + this.#keyboard.SHIFT : 0

      switch (code) {
        case 'KeyW':
          this.#keyboard.UP = keyType
          break
        case 'KeyS':
          this.#keyboard.DOWN = keyType
          break
        case 'KeyA':
          this.#keyboard.LEFT = keyType
          break
        case 'KeyD':
          this.#keyboard.RIGHT = keyType
          break
        case 'ShiftLeft':
          this.#keyboard.SHIFT = type === 'keydown' ? 0.3 : 0
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

        this.#UI_PAUSE.style.display = 'block'
        this.#BTN_CONTINUE.disabled = true
        setTimeout(() => (this.#BTN_CONTINUE.disabled = false), 1000)
      }
    })
  }

  touchpad() {
    const pointers = new Map()

    this.#canvas.style.touchAction = 'none'

    const recalculate = () => {
      this.#touchpad.LEFT = 0
      this.#touchpad.RIGHT = 0
      this.#touchpad.UP = 0
      this.#touchpad.DOWN = 0

      for (const [, pointer] of pointers) {
        if (pointer.side !== 'left') continue

        this.#touchpad.LEFT += pointer.LEFT ?? 0
        this.#touchpad.RIGHT += pointer.RIGHT ?? 0
        this.#touchpad.UP += pointer.UP ?? 0
        this.#touchpad.DOWN += pointer.DOWN ?? 0
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

    /**
     * touchpad buttons
     */

    this.#BTN_LOGO.addEventListener('click', () => {
      this.#UI_PAUSE.style.display = 'block'
      this.#BTN_CONTINUE.disabled = false
      this.IS_PAUSE = true
    })

    this.#BTN_CONTINUE.addEventListener('click', () => {
      this.#UI_PAUSE.style.display = 'none'
      this.IS_PAUSE = false
    })
  }

  gamepad() {
    const gamepadLoop = () => {
      window.requestAnimationFrame(gamepadLoop)

      const gamepad = navigator.getGamepads()[0]
      if (!gamepad) return

      /**
       * Pause
       */
      const PAUSE = gamepad.buttons[16].pressed

      if (PAUSE && !this.#gamepad.PAUSE_PRESSED) {
        this.#gamepad.PAUSE_PRESSED = true

        if (this.IS_PAUSE) {
          // this.#canvas.requestPointerLock()
          this.IS_PAUSE = false

          this.#UI_PAUSE.style.display = 'none'
        } else {
          // document.exitPointerLock()
          this.IS_PAUSE = true

          this.#UI_PAUSE.style.display = 'block'
          this.#BTN_CONTINUE.disabled = true
          setTimeout(() => (this.#BTN_CONTINUE.disabled = false), 1000)
        }
      }
      if (!PAUSE) {
        this.#gamepad.PAUSE_PRESSED = false
      }

      /**
       * Inputs
       */
      if (!this.IS_PAUSE) {
        // Sticks — umbral para evitar drift
        const DEAD_ZONE = 0.1
        const lx = Math.abs(gamepad.axes[0]) > DEAD_ZONE ? gamepad.axes[0] : 0
        const ly = Math.abs(gamepad.axes[1]) > DEAD_ZONE ? gamepad.axes[1] : 0
        const rx = Math.abs(gamepad.axes[2]) > DEAD_ZONE ? gamepad.axes[2] : 0
        const ry = Math.abs(gamepad.axes[3]) > DEAD_ZONE ? gamepad.axes[3] : 0

        // Movimiento (stick izquierdo)
        this.#gamepad.LEFT = lx < 0 ? -lx : 0
        this.#gamepad.RIGHT = lx > 0 ? lx : 0
        this.#gamepad.UP = ly < 0 ? -ly : 0
        this.#gamepad.DOWN = ly > 0 ? ly : 0

        // Cámara (stick derecho)
        this.AZIMUTH -= rx * 0.05
        this.POLAR -= ry * 0.05
        this.POLAR = Math.max(
          MathUtils.degToRad(30),
          Math.min(MathUtils.degToRad(60), this.POLAR)
        )
      }

      this.#mergeInputs()
    }

    gamepadLoop()
  }

  // pause() {
  //   this.IS_PAUSE = true
  // }

  // resume() {
  //   this.IS_PAUSE = false
  //   if (!this.IS_MOBILE) this.#canvas.requestPointerLock()
  // }

  #mergeInputs() {
    this.UP = Math.max(this.#keyboard.UP, this.#touchpad.UP, this.#gamepad.UP)
    this.DOWN = Math.max(
      this.#keyboard.DOWN,
      this.#touchpad.DOWN,
      this.#gamepad.DOWN
    )
    this.LEFT = Math.max(
      this.#keyboard.LEFT,
      this.#touchpad.LEFT,
      this.#gamepad.LEFT
    )
    this.RIGHT = Math.max(
      this.#keyboard.RIGHT,
      this.#touchpad.RIGHT,
      this.#gamepad.RIGHT
    )

    const max = Math.max(this.UP, this.DOWN, this.LEFT, this.RIGHT)
    this.IS_MOVE = max > 0.3
    this.IS_RUN = max > 0.7
  }
}

export default GameInput
