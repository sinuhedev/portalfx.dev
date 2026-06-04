import Floor from 'objects/Floor'
import Light from 'objects/Light'
import { Color, Fog, Scene } from 'three'

class LevelScene extends Scene {
  constructor() {
    super()
    this.background = new Color(0x5e5d5d)
    this.fog = new Fog(0x5e5d5d, 2, 20)

    this.add(new Light())
    this.add(new Floor())
  }

  dispose() {}
}

export default LevelScene
