import player from 'assets/models/player/player.glb?url'
import { AnimationMixer, MathUtils, Object3D, Quaternion, Vector3 } from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'

const up = new Vector3(0, 1, 0)
const velocity = 1.8
const velocityRun = 4.0
const fade = 0.5
const rotateSpeed = 0.05
const startAnimation = 'Idle'

class Player extends Object3D {
  #model
  #mixer
  #actions
  #currentAnimation = startAnimation
  #nextAnimation = startAnimation
  #position = new Vector3()

  async loadAsync() {
    const gltf = await new GLTFLoader().loadAsync(player)
    this.#model = gltf.scene

    this.#model.scale.set(0.01, 0.01, 0.01)
    this.#model.rotation.set(0, MathUtils.degToRad(180), 0)

    this.#mixer = new AnimationMixer(this.#model)
    this.#actions = gltf.animations
      .map((clip) => ({ [clip.name]: this.#mixer.clipAction(clip) }))
      .reduce((acc, obj) => ({ ...acc, ...obj }), {})

    this.add(this.#model)
  }

  update(delta, keys, camera) {
    // keys events
    if (keys.IS_MOVE) {
      this.#nextAnimation = 'Walk'
      if (keys.IS_RUN) {
        this.#nextAnimation = 'Run'
      }
    } else {
      this.#nextAnimation = 'Idle'
    }

    if (keys.IS_MOVE) {
      const direction = new Vector3(
        keys.RIGHT - keys.LEFT,
        0,
        keys.DOWN - keys.UP
      )
      const angle = Math.atan2(direction.x, direction.z)

      direction.multiplyScalar(
        (this.#currentAnimation === 'Run' ? velocityRun : velocity) * delta
      )
      direction.applyAxisAngle(up, keys.AZIMUTH)
      this.#position.add(direction)

      this.#model.position.copy(this.#position)
      this.#model.quaternion.rotateTowards(
        new Quaternion().setFromAxisAngle(up, angle + keys.AZIMUTH),
        rotateSpeed
      )

      camera.position.add(direction)
    }

    if (this.#currentAnimation !== this.#nextAnimation) {
      // currentAnimation
      let play = this.#actions[this.#currentAnimation]
      play._scheduleFading(fade, play.getEffectiveWeight(), 0)

      // nextAnimation
      play = this.#actions[this.#nextAnimation]
      play.reset()
      play.stopFading()
      play._scheduleFading(fade, play.getEffectiveWeight(), 1)

      this.#currentAnimation = this.#nextAnimation
    }

    this.#actions[this.#currentAnimation].play()

    const x = keys.CAMERA_RADIUS * Math.sin(keys.POLAR) * Math.sin(keys.AZIMUTH)

    const y = keys.CAMERA_RADIUS * Math.cos(keys.POLAR)

    const z = keys.CAMERA_RADIUS * Math.sin(keys.POLAR) * Math.cos(keys.AZIMUTH)

    camera.position.set(x, y, z).add(this.#model.position)
    camera.lookAt(this.#model.position.clone().add(new Vector3(0, 1, 0)))

    this.#mixer.update(delta)
  }

  dispose() {}
}

export default Player
