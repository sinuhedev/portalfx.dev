import 'utils/serviceWorker'
import Player from 'objects/Player'
import LevelScene from 'scenes/LevelScene'
import GameEngine from './lib/GameEngine'

class Game extends GameEngine {
  #scene
  #player

  constructor(canvas) {
    super(canvas)
    this.#player = new Player()
  }

  async onInit() {
    await this.#player.loadAsync()

    this.#scene = new LevelScene()
    this.camera.position.z = 5
    this.#scene.add(this.#player)
  }

  onAnimate(delta) {
    this.#player.update(delta, this.input, this.camera)

    this.renderer.render(this.#scene, this.camera)
  }

  onDispose() {}
}

const canvas = document.querySelector('canvas')
const game = new Game(canvas)
game.start()
