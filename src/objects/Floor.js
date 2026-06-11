import diffuseTexture from 'assets/textures/Rock035_1K-JPG_Diff.jpg'
import normalTexture from 'assets/textures/Rock035_1K-JPG_NormalGL.jpg'
import {
  MathUtils,
  Mesh,
  MeshStandardMaterial,
  Object3D,
  PlaneGeometry,
  PointLight,
  RepeatWrapping,
  SphereGeometry,
  TextureLoader,
  Vector2
} from 'three'

class Floor extends Object3D {
  constructor() {
    super()

    const size = 50
    const repeat = 16

    const floorT = new TextureLoader().load(diffuseTexture)
    floorT.repeat.set(repeat, repeat)
    floorT.wrapS = floorT.wrapT = RepeatWrapping

    const floorN = new TextureLoader().load(normalTexture)
    floorN.repeat.set(repeat, repeat)
    floorN.wrapS = floorN.wrapT = RepeatWrapping

    const mat = new MeshStandardMaterial({
      map: floorT,
      normalMap: floorN,
      normalScale: new Vector2(1, 1),
      color: 0x404040,
      depthWrite: false,
      roughness: 0.85
    })

    const g = new PlaneGeometry(size, size, 50, 50)
    g.rotateX(-MathUtils.degToRad(90))

    const floor = new Mesh(g, mat)
    const bulbGeometry = new SphereGeometry(0.05, 16, 8)
    const bulbLight = new PointLight(0xffee88, 2, 500, 2)

    const bulbMat = new MeshStandardMaterial({
      emissive: 0xffffee,
      emissiveIntensity: 1,
      color: 0x000000
    })
    bulbLight.add(new Mesh(bulbGeometry, bulbMat))
    bulbLight.position.set(1, 0.1, -3)
    floor.add(bulbLight)

    this.add(floor)
  }

  dispose() {}
}

export default Floor
