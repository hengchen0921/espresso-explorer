import { CanvasTexture, RepeatWrapping, Vector2, type Texture } from 'three'

/**
 * Procedural surface maps.
 *
 * The single biggest reason primitive geometry reads as "3D shapes" rather
 * than "an appliance" is that real metal is not uniform: brushed stainless has
 * directional grain, moulded plastic has a fine matte texture, and both scatter
 * highlights instead of producing one clean specular blob. These are generated
 * once into a canvas at runtime — no asset to download, no licence to worry
 * about — and shared across every material that asks for them.
 */

interface SurfaceMaps {
  roughnessMap: Texture
  normalMap: Texture
  normalScale: Vector2
}

function makeCanvas(size: number) {
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  return canvas
}

/** Derives a tangent-space normal map from a height/roughness image. */
function normalFromHeight(source: HTMLCanvasElement, strength: number): CanvasTexture {
  const size = source.width
  const src = source.getContext('2d')!.getImageData(0, 0, size, size)
  const out = makeCanvas(size)
  const ctx = out.getContext('2d')!
  const image = ctx.createImageData(size, size)

  const at = (x: number, y: number) => {
    const px = ((y + size) % size) * size + ((x + size) % size)
    return src.data[px * 4] / 255
  }

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const dx = (at(x - 1, y) - at(x + 1, y)) * strength
      const dy = (at(x, y - 1) - at(x, y + 1)) * strength
      const length = Math.hypot(dx, dy, 1)
      const i = (y * size + x) * 4
      image.data[i] = ((dx / length) * 0.5 + 0.5) * 255
      image.data[i + 1] = ((dy / length) * 0.5 + 0.5) * 255
      image.data[i + 2] = (1 / length) * 255
      image.data[i + 3] = 255
    }
  }

  ctx.putImageData(image, 0, 0)
  return new CanvasTexture(out)
}

function tile(texture: Texture, repeat: number) {
  texture.wrapS = RepeatWrapping
  texture.wrapT = RepeatWrapping
  texture.repeat.set(repeat, repeat)
  texture.anisotropy = 8
  texture.needsUpdate = true
  return texture
}

let brushed: SurfaceMaps | null = null

/** Directional grain, as left by a linishing belt. */
export function brushedMetalMaps(): SurfaceMaps {
  if (brushed) return brushed

  const size = 512
  const canvas = makeCanvas(size)
  const ctx = canvas.getContext('2d')!

  ctx.fillStyle = '#8c8c8c'
  ctx.fillRect(0, 0, size, size)

  // Long, shallow, overlapping horizontal strokes at varying brightness.
  for (let i = 0; i < 14000; i++) {
    const x = Math.random() * size
    const y = Math.random() * size
    const length = 24 + Math.random() * 210
    const value = Math.round(96 + Math.random() * 84)
    ctx.strokeStyle = `rgba(${value},${value},${value},0.13)`
    ctx.lineWidth = Math.random() < 0.78 ? 1 : 2
    ctx.beginPath()
    ctx.moveTo(x, y)
    ctx.lineTo(x + length, y)
    ctx.stroke()
  }

  brushed = {
    roughnessMap: tile(new CanvasTexture(canvas), 4),
    normalMap: tile(normalFromHeight(canvas, 1.4), 4),
    normalScale: new Vector2(0.14, 0.14),
  }
  return brushed
}

let grain: SurfaceMaps | null = null

/** Fine isotropic speckle — moulded plastic and powder-coated panels. */
export function mouldedGrainMaps(): SurfaceMaps {
  if (grain) return grain

  const size = 256
  const canvas = makeCanvas(size)
  const ctx = canvas.getContext('2d')!
  const image = ctx.createImageData(size, size)

  for (let i = 0; i < size * size; i++) {
    const value = 150 + Math.random() * 52
    image.data[i * 4] = value
    image.data[i * 4 + 1] = value
    image.data[i * 4 + 2] = value
    image.data[i * 4 + 3] = 255
  }
  ctx.putImageData(image, 0, 0)

  grain = {
    roughnessMap: tile(new CanvasTexture(canvas), 9),
    normalMap: tile(normalFromHeight(canvas, 0.55), 9),
    normalScale: new Vector2(0.32, 0.32),
  }
  return grain
}

export type SurfaceMapKind = 'brushed' | 'grain'

export function surfaceMaps(kind: SurfaceMapKind): SurfaceMaps {
  return kind === 'brushed' ? brushedMetalMaps() : mouldedGrainMaps()
}
