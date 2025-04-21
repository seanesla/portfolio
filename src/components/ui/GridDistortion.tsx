import { useRef, useEffect } from 'react'
import * as THREE from 'three'

interface Props {
  imageSrc: string
  grid?: number
  mouse?: number
  strength?: number
  relaxation?: number
  className?: string
}

const vertexShader = `
uniform float time;
varying vec2 vUv;
varying vec3 vPosition;

void main() {
  vUv = uv;
  vPosition = position;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`

const fragmentShader = `
uniform sampler2D uDataTexture;
uniform sampler2D uTexture;
uniform vec4 resolution;
uniform vec2 uImageRes;
varying vec2 vUv;

void main() {
  // object-cover style UV mapping
  float containerAspect = resolution.x / resolution.y;
  float imageAspect = uImageRes.x / uImageRes.y;
  vec2 uv = vUv;
  if (imageAspect > containerAspect) {
    float scale = containerAspect / imageAspect;
    uv.x = uv.x * scale + (1.0 - scale) * 0.5;
  } else {
    float scale = imageAspect / containerAspect;
    uv.y = uv.y * scale + (1.0 - scale) * 0.5;
  }
  vec4 offset = texture2D(uDataTexture, vUv);
  gl_FragColor = texture2D(uTexture, uv - 0.02 * offset.rg);
}
`

export default function GridDistortion({
  imageSrc,
  grid = 15,
  mouse = 0.1,
  strength = 0.15,
  relaxation = 0.9,
  className = '',
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const scene = new THREE.Scene()

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setClearColor(0x000000, 0)
    container.innerHTML = ''
    container.appendChild(renderer.domElement)

    const camera = new THREE.OrthographicCamera(0, 0, 0, 0, -1000, 1000)
    camera.position.z = 2

    const size = grid
    const data = new Float32Array(4 * size * size)
    for (let i = 0; i < size * size; i++) {
      data[i * 4] = Math.random() * 255 - 125
      data[i * 4 + 1] = Math.random() * 255 - 125
    }

    const dataTexture = new THREE.DataTexture(data, size, size, THREE.RGBAFormat, THREE.FloatType)
    dataTexture.needsUpdate = true

    const uniforms = {
      time: { value: 0 },
      resolution: { value: new THREE.Vector4() },
      uTexture: { value: null as THREE.Texture | null },
      uDataTexture: { value: dataTexture },
      uImageRes: { value: new THREE.Vector2(1, 1) },
    }

    const material = new THREE.ShaderMaterial({
      side: THREE.DoubleSide,
      uniforms,
      vertexShader,
      fragmentShader,
      transparent: true,
    })

    const geometry = new THREE.PlaneGeometry(1, 1, size - 1, size - 1)
    const plane = new THREE.Mesh(geometry, material)
    scene.add(plane)

    const textureLoader = new THREE.TextureLoader()
    textureLoader.load(imageSrc, (texture) => {
      texture.minFilter = THREE.LinearFilter
      texture.magFilter = THREE.LinearFilter
      texture.wrapS = THREE.ClampToEdgeWrapping
      texture.wrapT = THREE.ClampToEdgeWrapping
      uniforms.uTexture.value = texture
      uniforms.uImageRes.value.set(texture.image.width, texture.image.height)
      handleResize()
    })

    const handleResize = () => {
      const rect = container.getBoundingClientRect()
      const w = rect.width
      const h = rect.height
      if (w === 0 || h === 0) return

      renderer.setSize(w, h)
      const aspect = w / h
      plane.scale.set(aspect, 1, 1)
      camera.left = -aspect / 2
      camera.right = aspect / 2
      camera.top = 0.5
      camera.bottom = -0.5
      camera.updateProjectionMatrix()
      uniforms.resolution.value.set(w, h, 1, 1)
    }

    const ro = new ResizeObserver(() => handleResize())
    ro.observe(container)

    const mouseState = { x: 0, y: 0, prevX: 0, prevY: 0, vX: 0, vY: 0 }

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect()
      const x = (e.clientX - rect.left) / rect.width
      const y = 1 - (e.clientY - rect.top) / rect.height
      mouseState.vX = x - mouseState.prevX
      mouseState.vY = y - mouseState.prevY
      Object.assign(mouseState, { x, y, prevX: x, prevY: y })
    }

    const handleMouseLeave = () => {
      Object.assign(mouseState, { x: 0, y: 0, prevX: 0, prevY: 0, vX: 0, vY: 0 })
    }

    container.addEventListener('mousemove', handleMouseMove)
    container.addEventListener('mouseleave', handleMouseLeave)
    handleResize()

    let animId: number
    const animate = () => {
      animId = requestAnimationFrame(animate)
      uniforms.time.value += 0.05

      const d = dataTexture.image.data as Float32Array
      for (let i = 0; i < size * size; i++) {
        d[i * 4] *= relaxation
        d[i * 4 + 1] *= relaxation
      }

      const gx = size * mouseState.x
      const gy = size * mouseState.y
      const maxDist = size * mouse

      for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
          const distSq = (gx - i) ** 2 + (gy - j) ** 2
          if (distSq < maxDist * maxDist) {
            const idx = 4 * (i + size * j)
            const power = Math.min(maxDist / Math.sqrt(distSq), 10)
            d[idx] += strength * 100 * mouseState.vX * power
            d[idx + 1] -= strength * 100 * mouseState.vY * power
          }
        }
      }

      dataTexture.needsUpdate = true
      renderer.render(scene, camera)
    }

    animate()

    return () => {
      cancelAnimationFrame(animId)
      ro.disconnect()
      container.removeEventListener('mousemove', handleMouseMove)
      container.removeEventListener('mouseleave', handleMouseLeave)
      renderer.dispose()
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement)
      }
      geometry.dispose()
      material.dispose()
      dataTexture.dispose()
      if (uniforms.uTexture.value) uniforms.uTexture.value.dispose()
    }
  }, [imageSrc, grid, mouse, strength, relaxation])

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden ${className}`}
      style={{ width: '100%', height: '100%' }}
    />
  )
}
