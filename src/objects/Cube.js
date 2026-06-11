import textureFrag from 'assets/shaders/texture.frag.glsl'
import textureVert from 'assets/shaders/texture.vert.glsl'
import rockTesture from 'assets/textures/rock.webp'
import {
  BoxGeometry,
  Mesh,
  Object3D,
  ShaderMaterial,
  TextureLoader
} from 'three'

class Cube extends Object3D {
  constructor() {
    super()

    const texture = new TextureLoader().load(rockTesture)
    this.geometry = new BoxGeometry()
    this.material = new ShaderMaterial({
      uniforms: {
        uTexture: { value: texture }
      },
      vertexShader: textureVert,
      fragmentShader: textureFrag
    })
    this.mesh = new Mesh(this.geometry, this.material)

    this.add(this.mesh)
  }

  dispose() {
    this.geometry.dispose()
    this.material.dispose()
  }
}

export default Cube
