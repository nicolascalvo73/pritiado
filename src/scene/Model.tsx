import { Component, Suspense, useEffect, useLayoutEffect, useMemo, useRef, useState, type ComponentType, type ReactNode } from 'react'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'

/**
 * Objeto de una etapa: muestra el .glb de `url` si hay uno y, si no (o si falla al cargar), el objeto generado.
 * El .glb se escala para ocupar la misma altura que el objeto generado, apoyado en la misma base
 * y centrado en X/Z, así conserva el lugar sobre el pedestal y la rotación del carrusel.
 */
export function StageObject({ Generic, url }: { Generic: ComponentType; url?: string }) {
  const generic = useRef<THREE.Group>(null)
  const [fit, setFit] = useState<THREE.Box3 | null>(null)
  const [ready, setReady] = useState(false)

  // caja del objeto generado, en sus coordenadas locales (antes del primer cuadro no hay giro ni balanceo)
  useLayoutEffect(() => {
    const g = generic.current
    if (!g) return
    g.updateWorldMatrix(true, true)
    const box = new THREE.Box3().setFromObject(g, true)
    box.applyMatrix4(g.matrixWorld.clone().invert())
    setFit(box)
  }, [])

  return (
    <>
      <group ref={generic} visible={!ready}>
        <Generic />
      </group>
      {url && fit && (
        <Fallback onError={() => setReady(false)}>
          <Suspense fallback={null}>
            <Glb url={url} fit={fit} onReady={() => setReady(true)} />
          </Suspense>
        </Fallback>
      )}
    </>
  )
}

function Glb({ url, fit, onReady }: { url: string; fit: THREE.Box3; onReady: () => void }) {
  const { scene } = useGLTF(url)
  const obj = useMemo(() => {
    const root = scene.clone(true)
    const box = new THREE.Box3().setFromObject(root, true)
    const size = box.getSize(new THREE.Vector3())
    const want = fit.getSize(new THREE.Vector3())
    const k = size.y > 0 ? want.y / size.y : 1
    const c = box.getCenter(new THREE.Vector3())
    const fc = fit.getCenter(new THREE.Vector3())
    root.scale.setScalar(k)
    root.position.set(fc.x - c.x * k, fit.min.y - box.min.y * k, fc.z - c.z * k)
    const wrap = new THREE.Group()
    wrap.add(root)
    return wrap
  }, [scene, fit])
  useEffect(onReady, [obj, onReady])
  return <primitive object={obj} />
}

class Fallback extends Component<{ children: ReactNode; onError: () => void }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  componentDidCatch(e: unknown) {
    console.warn('No se pudo cargar el modelo .glb; queda el objeto generado.', e)
    this.props.onError()
  }
  render() {
    return this.state.failed ? null : this.props.children
  }
}
