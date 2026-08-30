import type { Vec3 } from './types'

const DEG = Math.PI / 180

/**
 * Camera placement in spherical coordinates around a look-at point.
 * Azimuth 0° faces the front of the machine (+Z); positive swings right.
 * Elevation 0° is level with the target; positive looks down at it.
 *
 * Every anchor in every model is authored through this, which is why the
 * camera moves feel like one system rather than eight hand-tuned positions.
 */
export function frame(
  target: Vec3,
  azimuthDeg: number,
  elevationDeg: number,
  distance: number,
): { position: Vec3; target: Vec3 } {
  const az = azimuthDeg * DEG
  const el = elevationDeg * DEG
  return {
    position: [
      target[0] + Math.sin(az) * Math.cos(el) * distance,
      target[1] + Math.sin(el) * distance,
      target[2] + Math.cos(az) * Math.cos(el) * distance,
    ],
    target,
  }
}

/** Outward surface normal from the same angle convention. */
export function normal(azimuthDeg: number, elevationDeg = 0): Vec3 {
  const az = azimuthDeg * DEG
  const el = elevationDeg * DEG
  return [Math.sin(az) * Math.cos(el), Math.sin(el), Math.cos(az) * Math.cos(el)]
}

/** Push a framing closer to or further from its target without changing angle. */
export function scaleFraming(
  framing: { position: Vec3; target: Vec3 },
  factor: number,
): { position: Vec3; target: Vec3 } {
  const [px, py, pz] = framing.position
  const [tx, ty, tz] = framing.target
  return {
    position: [tx + (px - tx) * factor, ty + (py - ty) * factor, tz + (pz - tz) * factor],
    target: framing.target,
  }
}
