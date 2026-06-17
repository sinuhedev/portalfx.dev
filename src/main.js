import 'utils/serviceWorker'
import Player from 'objects/Player'
import LevelScene from 'scenes/LevelScene'
import { getVersion } from 'utils'
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
    this.#scene.add(this.#player)
  }

  onAnimate(delta) {
    this.#player.update(delta, this.input, this.camera)

    this.renderer.render(this.#scene, this.camera)
  }

  onDispose() {}
}

// version
document.getElementById('txt-version').textContent = getVersion().version
document.getElementById('txt-commit').textContent = getVersion().commit
document.getElementById('txt-date').textContent = getVersion().date

// game
const canvas = document.querySelector('canvas')
const game = new Game(canvas)
game.start()
