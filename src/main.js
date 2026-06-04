import 'utils/serviceWorker'
import Player from 'objects/Player'
import LevelScene from 'scenes/LevelScene'
import { WebGLGame } from 'utils'

class Game extends WebGLGame {
  #scene
  #player

  constructor() {
    super(document.querySelector('canvas'))
    this.#player = new Player()
  }

  async onInit() {
    await this.#player.loadAsync()

    this.#scene = new LevelScene()
    this.camera.position.z = 5
    this.#scene.add(this.#player)
  }

  onAnimate(delta) {
    this.#player.update(delta, this.keys, this.camera)

    this.renderer.render(this.#scene, this.camera)
  }

  onDispose() {}
}

const game = new Game()
game.start()
