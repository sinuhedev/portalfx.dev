import { MathUtils } from 'three'

class GameInput {
  UP = 0
  DOWN = 0
  LEFT = 0
  RIGHT = 0
  IS_PAUSE = false
  IS_MOVE = false
  IS_RUN = false
  AZIMUTH = 0 // angulo horizontal
  POLAR = MathUtils.degToRad(70) // angulo vertical
  SENSITIVITY = 100
  CAMERA_RADIUS = 3

  keyboard = {
    UP: 0,
    RIGHT: 0,
    DOWN: 0,
    LEFT: 0,
    SHIFT: 0
  }
  touchpad = {
    UP: 0,
    RIGHT: 0,
    DOWN: 0,
    LEFT: 0
  }
  gamepad = {
    UP: 0,
    RIGHT: 0,
    DOWN: 0,
    LEFT: 0,
    PAUSE_PRESSED: false
  }

  constructor() {}
}

export default GameInput
