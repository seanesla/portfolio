import { useEffect, useRef } from 'react'

const vertexShader = `
attribute vec2 position;
void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}
`

const fragmentShader = `
precision highp float;

uniform float uTime;
uniform vec2 uResolution;

#define PI 3.14159265359
#define LAYERS 5.0

// Smooth noise
float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  vec2 shift = vec2(100.0);
  mat2 rot = mat2(cos(0.5), sin(0.5), -sin(0.5), cos(0.5));
  for (int i = 0; i < 4; i++) {
    v += a * noise(p);
    p = rot * p * 2.0 + shift;
    a *= 0.5;
  }
  return v;
}

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution.xy;
  float aspect = uResolution.x / uResolution.y;
  vec2 p = uv;
  p.x *= aspect;

  float t = uTime * 0.15;

  // Deep ocean base colors
  vec3 deepBlue = vec3(0.02, 0.04, 0.12);
  vec3 midBlue  = vec3(0.05, 0.10, 0.25);
  vec3 accentBlue = vec3(0.30, 0.50, 0.85);
  vec3 highlight = vec3(0.55, 0.70, 1.0);

  // Layered wave distortion
  float waveAccum = 0.0;
  for (float i = 0.0; i < LAYERS; i++) {
    float fi = i + 1.0;
    float freq = 1.5 + fi * 0.8;
    float amp = 0.12 / fi;
    float speed = t * (0.5 + fi * 0.15);

    float wave = sin(p.x * freq * PI + speed + fbm(p * fi + t * 0.3) * 2.0) * amp;
    wave += cos(p.x * freq * 0.7 * PI - speed * 0.8 + i * 1.3) * amp * 0.5;
    waveAccum += wave;
  }

  float waveY = uv.y + waveAccum;

  // Color mixing based on wave displacement
  float blend1 = smoothstep(0.0, 1.0, waveY);
  float blend2 = smoothstep(0.2, 0.8, waveY + sin(t + uv.x * 3.0) * 0.1);

  vec3 col = mix(deepBlue, midBlue, blend1);
  col = mix(col, accentBlue, smoothstep(0.4, 0.7, waveY + fbm(p * 3.0 + t) * 0.15));

  // Subtle bright caustic highlights
  float caustic = fbm(p * 4.0 + vec2(t * 0.4, t * 0.2));
  caustic = smoothstep(0.5, 0.8, caustic);
  col += highlight * caustic * 0.08 * blend2;

  // Subtle glow in upper region
  float glow = smoothstep(0.3, 0.9, uv.y) * 0.15;
  col += accentBlue * glow * (0.5 + 0.5 * sin(t * 0.5));

  // Vignette to blend with site's dark bg
  float vig = 1.0 - smoothstep(0.3, 0.85, length((uv - 0.5) * vec2(1.2, 1.6)));
  col *= 0.7 + 0.3 * vig;

  // Ensure edges match site's dark background
  col = mix(deepBlue * 0.5, col, smoothstep(0.0, 0.15, uv.y) * smoothstep(1.0, 0.85, uv.y));

  gl_FragColor = vec4(col, 1.0);
}
`

interface WaveBackgroundProps {
  paused?: boolean
}

export default function WaveBackground({ paused = false }: WaveBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef = useRef<number>(0)
  const pausedRef = useRef(paused)
  pausedRef.current = paused

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    let gl: WebGLRenderingContext | null = null
    let uTime: WebGLUniformLocation | null = null
    let uResolution: WebGLUniformLocation | null = null
    const start = performance.now()

    function initGL() {
      gl = canvas!.getContext('webgl', {
        alpha: false,
        antialias: false,
        powerPreference: 'low-power',
      })
      if (!gl) return false

      function createShader(type: number, source: string): WebGLShader | null {
        const shader = gl!.createShader(type)
        if (!shader) return null
        gl!.shaderSource(shader, source)
        gl!.compileShader(shader)
        if (!gl!.getShaderParameter(shader, gl!.COMPILE_STATUS)) {
          console.error('WaveBackground shader error:', gl!.getShaderInfoLog(shader))
          gl!.deleteShader(shader)
          return null
        }
        return shader
      }

      const vs = createShader(gl.VERTEX_SHADER, vertexShader)
      const fs = createShader(gl.FRAGMENT_SHADER, fragmentShader)
      if (!vs || !fs) return false

      const program = gl.createProgram()!
      gl.attachShader(program, vs)
      gl.attachShader(program, fs)
      gl.linkProgram(program)
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error('WaveBackground link error:', gl.getProgramInfoLog(program))
        return false
      }
      gl.useProgram(program)

      const buffer = gl.createBuffer()
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
        -1, -1, 1, -1, -1, 1,
        -1, 1, 1, -1, 1, 1,
      ]), gl.STATIC_DRAW)

      const posAttr = gl.getAttribLocation(program, 'position')
      gl.enableVertexAttribArray(posAttr)
      gl.vertexAttribPointer(posAttr, 2, gl.FLOAT, false, 0, 0)

      uTime = gl.getUniformLocation(program, 'uTime')
      uResolution = gl.getUniformLocation(program, 'uResolution')

      // Use DPR 1 to reduce GPU memory
      canvas!.width = canvas!.clientWidth
      canvas!.height = canvas!.clientHeight
      gl.viewport(0, 0, canvas!.width, canvas!.height)

      return true
    }

    function resize() {
      if (!gl || gl.isContextLost()) return
      canvas!.width = canvas!.clientWidth
      canvas!.height = canvas!.clientHeight
      gl.viewport(0, 0, canvas!.width, canvas!.height)
    }

    function render() {
      if (!pausedRef.current && gl && !gl.isContextLost()) {
        const elapsed = (performance.now() - start) / 1000
        gl.uniform1f(uTime, elapsed)
        gl.uniform2f(uResolution, canvas!.width, canvas!.height)
        gl.drawArrays(gl.TRIANGLES, 0, 6)
      }
      rafRef.current = requestAnimationFrame(render)
    }

    function onContextLost(e: Event) {
      e.preventDefault()
      cancelAnimationFrame(rafRef.current)
    }

    function onContextRestored() {
      if (initGL()) {
        rafRef.current = requestAnimationFrame(render)
      }
    }

    canvas.addEventListener('webglcontextlost', onContextLost)
    canvas.addEventListener('webglcontextrestored', onContextRestored)
    window.addEventListener('resize', resize)

    if (initGL()) {
      rafRef.current = requestAnimationFrame(render)
    }

    return () => {
      cancelAnimationFrame(rafRef.current)
      canvas.removeEventListener('webglcontextlost', onContextLost)
      canvas.removeEventListener('webglcontextrestored', onContextRestored)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full"
    />
  )
}
