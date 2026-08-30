import { ContactShadows, Environment, Lightformer } from '@react-three/drei'

/**
 * A small studio built out of light shapes rather than an HDRI download: three
 * soft rect lights and a strip, which is what gives the brushed and chromed
 * surfaces something to reflect. Keeping it local means the viewer works
 * offline and adds nothing to the network waterfall.
 */
export function Stage({ radius = 0.6 }: { radius?: number }) {
  // Shadow frustum is sized to the model rather than left at the default 5 m,
  // which at this scale would quantise every shadow into staircases.
  const extent = Math.max(radius * 1.2, 0.25)

  return (
    <>
      <ambientLight intensity={0.45} />
      <directionalLight
        position={[1.4, 2.2, 1.6]}
        intensity={1.35}
        color="#fff4e6"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0004}
        shadow-normalBias={0.003}
        shadow-camera-near={0.5}
        shadow-camera-far={7}
        shadow-camera-left={-extent}
        shadow-camera-right={extent}
        shadow-camera-top={extent}
        shadow-camera-bottom={-extent}
      />
      <directionalLight position={[-1.8, 1.1, -1.2]} intensity={0.5} color="#b9cede" />
      {/* Kicker from below-front: stops the drip tray and portafilter from
          disappearing into the vignette on dark-cased machines. */}
      <directionalLight position={[0.2, -0.4, 1.6]} intensity={0.32} color="#ffe6cd" />

      <Environment resolution={256} frames={1}>
        {/* Key: broad soft box above and to the right */}
        <Lightformer
          form="rect"
          intensity={3.8}
          color="#fff2e2"
          position={[2.4, 3.2, 2]}
          scale={[5, 5, 1]}
          target={[0, 0.2, 0]}
        />
        {/* Fill from camera left, cooler so the metal reads as metal */}
        <Lightformer
          form="rect"
          intensity={2}
          color="#cfe0ef"
          position={[-3.2, 1.4, 1.4]}
          scale={[4, 4, 1]}
          target={[0, 0.2, 0]}
        />
        {/* Long rim strip behind, which draws the edge highlight down the case */}
        <Lightformer
          form="rect"
          intensity={3}
          color="#ffd9b8"
          position={[0, 1.6, -3]}
          scale={[6, 0.6, 1]}
          target={[0, 0.2, 0]}
        />
        {/* Bounce off the "counter" */}
        <Lightformer
          form="rect"
          intensity={0.7}
          color="#4a3a30"
          position={[0, -1.6, 0]}
          rotation={[Math.PI / 2, 0, 0]}
          scale={[8, 8, 1]}
        />
      </Environment>

      <ContactShadows
        position={[0, 0.001, 0]}
        opacity={0.62}
        scale={radius * 4}
        blur={2.6}
        far={0.5}
        resolution={512}
        color="#120c08"
      />
    </>
  )
}
