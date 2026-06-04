import { DirectionalLight, Object3D } from 'three'

class Light extends Object3D {
  constructor() {
    super()

    const dirLight = new DirectionalLight(0xffffff, 5)
    dirLight.position.set(-2, 5, -3)

    this.add(dirLight)
  }

  dispose() {}
}

export default Light
