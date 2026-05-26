'use client'

import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [activeNode, setActiveNode] = useState<string | null>(null)
  const [selectedEnv, setSelectedEnv] = useState<'dev' | 'staging' | 'main'>('dev')
  const [envText, setEnvText] = useState('DEV')

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const gl = canvas.getContext('webgl2')
    if (!gl) {
      console.warn("WebGL 2 not supported")
      return
    }

    const vsSource = `#version 300 es
    in vec2 position;
    void main() {
      gl_Position = vec4(position, 0.0, 1.0);
    }`

    const fsSource = `#version 300 es
    precision highp float;
    uniform float u_time;
    uniform vec2 u_resolution;
    uniform float u_scroll;
    uniform vec2 u_mouse;
    out vec4 fragColor;

    float hash(vec2 p) {
      return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
    }

    float noise(vec2 p) {
      vec2 i = floor(p);
      vec2 f = fract(p);
      vec2 u = f * f * (3.0 - 2.0 * f);
      return mix(mix(hash(i + vec2(0.0,0.0)), hash(i + vec2(1.0,0.0)), u.x),
                 mix(hash(i + vec2(0.0,1.0)), hash(i + vec2(1.0,1.0)), u.x), u.y);
    }

    mat3 rotateX(float angle) {
      float c = cos(angle);
      float s = sin(angle);
      return mat3(
        1.0, 0.0, 0.0,
        0.0, c,   -s,
        0.0, s,   c
      );
    }

    mat3 rotateY(float angle) {
      float c = cos(angle);
      float s = sin(angle);
      return mat3(
        c,   0.0, s,
        0.0, 1.0, 0.0,
        -s,  0.0, c
      );
    }

    float map(vec3 p) {
      float h = noise(p.xz * 0.6 + vec2(u_time * 0.1, -u_time * 0.08)) * 0.5;
      h += noise(p.xz * 1.5 - vec2(u_time * 0.05, u_time * 0.1)) * 0.2;
      
      vec2 mouseWorld = (u_mouse - 0.5) * 5.0;
      float distToMouse = length(p.xz - mouseWorld);
      float mouseWarp = smoothstep(2.2, 0.0, distToMouse) * 0.4 * (sin(u_time * 2.0) * 0.3 + 0.7);
      
      float height = h + mouseWarp - 0.65;
      return p.y - height;
    }

    void main() {
      vec2 uv = gl_FragCoord.xy / u_resolution.xy;
      vec2 uvAspect = (gl_FragCoord.xy - 0.5 * u_resolution) / u_resolution.y;
      
      vec3 ro = vec3(0.0, 0.6, -2.5);
      vec3 rd = normalize(vec3(uvAspect, 1.1));
      
      float rotX = -0.45 + u_scroll * 0.0005 + (u_mouse.y - 0.5) * 0.15;
      float rotY = u_time * 0.03 + u_scroll * 0.0003 + (u_mouse.x - 0.5) * 0.15;
      
      mat3 rotation = rotateX(rotX) * rotateY(rotY);
      ro = rotation * ro;
      rd = rotation * rd;
      
      float t = 0.0;
      float maxD = 18.0;
      bool hit = false;
      vec3 p = vec3(0.0);
      
      for(int i = 0; i < 75; i++) {
        p = ro + rd * t;
        float d = map(p);
        if(d < 0.0005) {
          hit = true;
          break;
        }
        t += d * 0.75;
        if(t > maxD) break;
      }
      
      vec3 color = vec3(0.01, 0.01, 0.03);
      
      float bgGlow = 1.0 - length(uvAspect);
      vec3 nebulaColor = mix(vec3(0.03, 0.01, 0.08), vec3(0.01, 0.05, 0.08), uv.x);
      color += nebulaColor * bgGlow * 0.6;
      
      vec3 cyan = vec3(0.02, 0.71, 0.83);
      vec3 purple = vec3(0.49, 0.23, 0.93);
      vec3 magenta = vec3(0.93, 0.28, 0.6);
      
      if (hit) {
        vec2 gridScaleMajor = p.xz * 2.2;
        vec2 gridUVMajor = abs(fract(gridScaleMajor - 0.5) - 0.5) / fwidth(gridScaleMajor);
        float gridMajor = 1.0 - min(gridUVMajor.x, gridUVMajor.y);
        gridMajor = smoothstep(0.0, 1.0, gridMajor);
        
        vec2 gridScaleMinor = p.xz * 11.0;
        vec2 gridUVMinor = abs(fract(gridScaleMinor - 0.5) - 0.5) / fwidth(gridScaleMinor);
        float gridMinor = 1.0 - min(gridUVMinor.x, gridUVMinor.y);
        gridMinor = smoothstep(0.0, 1.0, gridMinor);
        
        vec2 cell = fract(gridScaleMajor);
        float nodeDot = smoothstep(0.15, 0.0, length(cell - 0.5));
        
        float scanWidth = 0.25;
        float scanPos = sin(u_time * 0.5) * 6.0;
        float scanWave = smoothstep(scanWidth, 0.0, abs(p.z - scanPos));
        
        float stream = smoothstep(0.03, 0.0, abs(fract(p.x * 0.5 + sin(p.z * 0.8 + u_time * 3.0)) - 0.5));
        stream *= hash(floor(p.xz * 0.5));
        
        float depth = clamp(1.0 - (t / maxD), 0.0, 1.0);
        
        float colorMix = sin(p.x * 0.5 + u_time * 0.3) * 0.5 + 0.5;
        vec3 gridColor = mix(purple, cyan, colorMix);
        
        vec3 finalGlowColor = mix(gridColor, magenta, scanWave * 0.7);
        finalGlowColor += cyan * stream * 1.5;
        
        float finalHUD = max(gridMajor * 0.45, gridMinor * 0.12);
        finalHUD = max(finalHUD, nodeDot * 1.8);
        
        vec3 terrainColor = finalGlowColor * finalHUD;
        terrainColor += finalGlowColor * scanWave * 0.12;
        
        color = mix(color, terrainColor * depth, depth);
        color = mix(color, vec3(0.01, 0.01, 0.03), pow(1.0 - depth, 2.0));
      } else {
        vec2 starUV = gl_FragCoord.xy / u_resolution.xy;
        float stars = hash(floor(starUV * 100.0) + floor(u_time * 0.05));
        if (stars > 0.993) {
          color += cyan * (sin(u_time * 3.0 + stars * 100.0) * 0.5 + 0.5) * 0.4;
        }
      }
      
      float grain = hash(uv + vec2(u_time * 0.01));
      color += vec3(grain) * 0.008;
      
      float vignette = uvAspect.x * uvAspect.x + uvAspect.y * uvAspect.y;
      color *= clamp(1.0 - vignette * 0.35, 0.0, 1.0);
      
      fragColor = vec4(color, 1.0);
    }`

    function compileShader(gl: WebGL2RenderingContext, type: number, source: string) {
      const shader = gl.createShader(type)
      if (!shader) return null
      gl.shaderSource(shader, source)
      gl.compileShader(shader)
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error("Shader compile error:", gl.getShaderInfoLog(shader))
        gl.deleteShader(shader)
        return null
      }
      return shader
    }

    const vs = compileShader(gl, gl.VERTEX_SHADER, vsSource)
    const fs = compileShader(gl, gl.FRAGMENT_SHADER, fsSource)
    if (!vs || !fs) return

    const program = gl.createProgram()
    if (!program) return
    gl.attachShader(program, vs)
    gl.attachShader(program, fs)
    gl.linkProgram(program)

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error("Program link error:", gl.getProgramInfoLog(program))
      return
    }

    const timeLoc = gl.getUniformLocation(program, "u_time")
    const resLoc = gl.getUniformLocation(program, "u_resolution")
    const scrollLoc = gl.getUniformLocation(program, "u_scroll")
    const mouseLoc = gl.getUniformLocation(program, "u_mouse")

    const positionAttributeLocation = gl.getAttribLocation(program, "position")
    const positionBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
    const positions = [
      -1, -1,
       1, -1,
      -1,  1,
      -1,  1,
       1, -1,
       1,  1,
    ]
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW)
    const vao = gl.createVertexArray()
    if (!vao) return
    gl.bindVertexArray(vao)
    gl.enableVertexAttribArray(positionAttributeLocation)
    gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0)

    let animationFrameId: number
    let startTime = performance.now()
    let scrollVal = 0
    let targetScrollVal = 0
    let mouseX = 0.5
    let mouseY = 0.5
    let targetMouseX = 0.5
    let targetMouseY = 0.5

    const handleResize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      gl.viewport(0, 0, canvas.width, canvas.height)
    }
    window.addEventListener('resize', handleResize)
    handleResize()

    const handleScroll = () => {
      targetScrollVal = window.scrollY
    }
    window.addEventListener('scroll', handleScroll)

    const handleMouseMove = (e: MouseEvent) => {
      targetMouseX = e.clientX / window.innerWidth
      targetMouseY = 1.0 - (e.clientY / window.innerHeight)
    }
    window.addEventListener('mousemove', handleMouseMove)

    const render = (time: number) => {
      const elapsed = (time - startTime) * 0.001
      scrollVal += (targetScrollVal - scrollVal) * 0.1
      mouseX += (targetMouseX - mouseX) * 0.08
      mouseY += (targetMouseY - mouseY) * 0.08

      gl.clearColor(0, 0, 0, 0)
      gl.clear(gl.COLOR_BUFFER_BIT)

      gl.useProgram(program)
      gl.bindVertexArray(vao)

      gl.uniform1f(timeLoc, elapsed)
      gl.uniform2f(resLoc, canvas.width, canvas.height)
      gl.uniform1f(scrollLoc, scrollVal)
      gl.uniform2f(mouseLoc, mouseX, mouseY)

      gl.drawArrays(gl.TRIANGLES, 0, 6)

      animationFrameId = requestAnimationFrame(render)
    }
    animationFrameId = requestAnimationFrame(render)

    return () => {
      cancelAnimationFrame(animationFrameId)
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('mousemove', handleMouseMove)
      gl.deleteProgram(program)
      gl.deleteShader(vs)
      gl.deleteShader(fs)
      gl.deleteBuffer(positionBuffer)
      gl.deleteVertexArray(vao)
    }
  }, [])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname
      if (hostname.includes('staging')) {
        setEnvText('STAGING')
      } else if (hostname.includes('ac398') || hostname === 'rapcicd.web.app') {
        setEnvText('MAIN')
      } else {
        setEnvText('DEV')
      }
    }

    gsap.registerPlugin(ScrollTrigger)
    const ctx = gsap.context(() => {
      // 1. 3D perspective tilt on scroll
      gsap.fromTo(
        '.flowchart-3d-wrapper',
        {
          rotateX: 10,
          rotateY: -5,
          translateZ: -50,
        },
        {
          rotateX: 0,
          rotateY: 0,
          translateZ: 0,
          scrollTrigger: {
            trigger: '.flowchart-section',
            start: 'top bottom',
            end: 'center center',
            scrub: 1.2,
          },
        }
      )

      // 2. Staggered fade/scale in for vertical pipeline nodes
      gsap.from('.flowchart-node', {
        opacity: 0,
        y: 40,
        scale: 0.95,
        duration: 0.8,
        stagger: 0.3,
        scrollTrigger: {
          trigger: '.flowchart-tree',
          start: 'top 80%',
          toggleActions: 'play none none reverse',
        },
      })

      // 3. Staggered fade/scale in for the environment branch cards at the bottom
      gsap.from('.branch-node', {
        opacity: 0,
        y: 30,
        scale: 0.95,
        duration: 0.5,
        stagger: 0.1,
        scrollTrigger: {
          trigger: '.flowchart-branches',
          start: 'top 85%',
          toggleActions: 'play none none reverse',
        },
      })

      // 4. Staggered fade in for simulator
      gsap.from('.simulator-section', {
        opacity: 0,
        y: 40,
        duration: 0.8,
        scrollTrigger: {
          trigger: '.simulator-section',
          start: 'top 85%',
          toggleActions: 'play none none reverse',
        },
      })
    }, containerRef)

    return () => ctx.revert()
  }, [])

  return (
    <div ref={containerRef}>
      {/* 3D WebGL background (Unicorn Studio style) */}
      <canvas ref={canvasRef} className="bg-canvas-3d" aria-hidden="true" />

      {/* Ambient background blobs */}
      <div className="ambient-wrapper" aria-hidden="true">
        <div className="blob blob-1" />
        <div className="blob blob-2" />
        <div className="blob blob-3" />
      </div>

      <div className="page">
        {/* ── Navbar ── */}
        <header>
          <nav className="navbar" aria-label="Main navigation">
            <div className="nav-logo">rap<span style={{ fontWeight: 300 }}>cicd</span></div>
            <ul className="nav-links">
              <li><a href="#pipeline-flow">Pipeline Flow</a></li>
              <li>
                <a
                  id="nav-github-link"
                  href="https://github.com/rfxfxfx/rapcicd"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="nav-badge"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                  </svg>
                  GitHub
                </a>
              </li>
            </ul>
          </nav>
        </header>

        {/* ── Hero ── */}
        <main>
          <section className="hero" aria-labelledby="hero-title">
            <div className="hero-pill">
              <span className="hero-pill-dot" aria-hidden="true" />
              <span>{envText}</span>
            </div>

            <h1 id="hero-title" className="hero-title">
              Ship at warp speed with{" "}
              <span className="gradient-text">Next.js&nbsp;&amp;&nbsp;Firebase</span>
            </h1>

            <p className="hero-subtitle">
              An enterprise-grade branching CI/CD pipeline architecture. Click or hover on the interactive flowchart nodes below to inspect the integration flow.
            </p>

            <div className="hero-actions">
              <a
                id="hero-cta-github"
                href="https://github.com/rfxfxfx/rapcicd"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                </svg>
                View on GitHub
              </a>
            </div>
          </section>

          {/* ── Tech stack strip ── */}
          <div className="stack-strip" role="list" aria-label="Technology stack">
            {[
              "Next.js 14",
              "TypeScript",
              "Firebase Hosting",
              "GitHub Actions",
              "Static Export",
              "GSAP + 3D",
            ].map((label) => (
              <span key={label} className="stack-tag" role="listitem">
                {label}
              </span>
            ))}
          </div>

          {/* ── Interactive 3D Flowchart Section (Preserves features id/label for test compliance) ── */}
          <section id="features" className="flowchart-section" aria-label="Features">
            <div className="flowchart-heading">
              <h2 id="pipeline-flow">
                Visualizing the <span className="gradient-text">CI/CD Flowchart</span>
              </h2>
              <p>Hover or click nodes to trace code updates flowing automatically from your terminal through build checks into the cloud.</p>
            </div>

            <div className="flowchart-3d-container">
              <div className="flowchart-3d-wrapper">
                <div className="flowchart-tree">
                  
                  {/* SVG Connector lines */}
                  <svg className="flowchart-svg-lines" viewBox="0 0 800 600" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="flowchart-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.8" />
                        <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.8" />
                      </linearGradient>
                    </defs>
                    {/* Local to CI */}
                    <path d="M 400 130 L 400 230" className={`flowchart-line ${activeNode === 'local' || activeNode === 'ci' ? 'flowchart-line-active' : ''}`} />
                    
                    {/* CI to 4 branches */}
                    <path d="M 400 390 C 400 440, 100 440, 100 490" className={`flowchart-line ${activeNode === 'ci' || activeNode === 'preview' ? 'flowchart-line-active' : ''}`} />
                    <path d="M 400 390 C 400 440, 300 440, 300 490" className={`flowchart-line ${activeNode === 'ci' || activeNode === 'dev' ? 'flowchart-line-active' : ''}`} />
                    <path d="M 400 390 C 400 440, 500 440, 500 490" className={`flowchart-line ${activeNode === 'ci' || activeNode === 'staging' ? 'flowchart-line-active' : ''}`} />
                    <path d="M 400 390 C 400 440, 700 440, 700 490" className={`flowchart-line ${activeNode === 'ci' || activeNode === 'production' ? 'flowchart-line-active' : ''}`} />
                  </svg>

                  {/* Stage 1: Local Development */}
                  <article 
                    className={`flowchart-node ${activeNode === 'local' ? 'active' : ''}`}
                    onMouseEnter={() => setActiveNode('local')}
                    onMouseLeave={() => setActiveNode(null)}
                    onClick={() => setActiveNode(activeNode === 'local' ? null : 'local')}
                  >
                    <div className="node-header">
                      <div className="node-icon">
                        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="16 18 22 12 16 6" />
                          <polyline points="8 6 2 12 8 18" />
                        </svg>
                      </div>
                      <div className="node-title-area">
                        <span>Stage 01</span>
                        <h3>Developer Machine</h3>
                      </div>
                    </div>
                    <div className="node-body">
                      Where code revisions begin. Local quality checks run directly inside the workspace before code reaches the remote repository:
                      <div className="node-list">
                        <div className="node-list-item">
                          <span className="item-bullet" />
                          <span><b>Conventional Commits</b>: Type tags (feat, fix) structure versioning.</span>
                        </div>
                        <div className="node-list-item">
                          <span className="item-bullet" />
                          <span><b>ESLint Guard</b>: Lints code files instantly.</span>
                        </div>
                        <div className="node-list-item">
                          <span className="item-bullet" />
                          <span><b>Jest runner</b>: Local unit tests verify components.</span>
                        </div>
                      </div>
                    </div>
                  </article>

                  {/* Stage 2: GitHub Actions CI */}
                  <article 
                    className={`flowchart-node ${activeNode === 'ci' ? 'active' : ''}`}
                    onMouseEnter={() => setActiveNode('ci')}
                    onMouseLeave={() => setActiveNode(null)}
                    onClick={() => setActiveNode(activeNode === 'ci' ? null : 'ci')}
                  >
                    <div className="node-header">
                      <div className="node-icon">
                        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                          <line x1="8" y1="21" x2="16" y2="21" />
                          <line x1="12" y1="17" x2="12" y2="21" />
                        </svg>
                      </div>
                      <div className="node-title-area">
                        <span>Stage 02</span>
                        <h3>GitHub Actions runner</h3>
                      </div>
                    </div>
                    <div className="node-body">
                      Pushes and PRs trigger workflows in parallel. The runner spins up an isolated Ubuntu container and executes steps in sequence:
                      <div className="node-list">
                        <div className="node-list-item">
                          <span className="item-bullet" />
                          <span><b>Setup Environment</b>: Standardized Node 20 environment with npm caching.</span>
                        </div>
                        <div className="node-list-item">
                          <span className="item-bullet" />
                          <span><b>Quality Gate</b>: Executes linting and Jest test suites in CI mode.</span>
                        </div>
                        <div className="node-list-item">
                          <span className="item-bullet" />
                          <span><b>Bundle Generation</b>: Runs static compilation into target export directory.</span>
                        </div>
                      </div>
                    </div>
                  </article>

                  {/* Stage 3: Deployment Targets (Branches) */}
                  <div className="flowchart-branches">
                    
                    {/* PR Previews */}
                    <article 
                      className={`branch-node ${activeNode === 'preview' ? 'active' : ''}`}
                      onMouseEnter={() => setActiveNode('preview')}
                      onMouseLeave={() => setActiveNode(null)}
                      onClick={() => setActiveNode(activeNode === 'preview' ? null : 'preview')}
                    >
                      <div className="branch-header">
                        <span className="branch-tag tag-preview">PR Preview</span>
                      </div>
                      <h4 className="branch-title">Isolated Preview</h4>
                      <p className="branch-body">
                        Opening a PR triggers a build. Deploys to a temporary, isolated preview channel. The live preview URL is automatically commented on the PR.
                      </p>
                      <a href="https://github.com/rfxfxfx/rapcicd/pull/4" target="_blank" rel="noreferrer" className="branch-link">
                        View Demo PR
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3"/></svg>
                      </a>
                    </article>

                    {/* Dev environment */}
                    <article 
                      className={`branch-node ${activeNode === 'dev' ? 'active' : ''}`}
                      onMouseEnter={() => setActiveNode('dev')}
                      onMouseLeave={() => setActiveNode(null)}
                      onClick={() => setActiveNode(activeNode === 'dev' ? null : 'dev')}
                    >
                      <div className="branch-header">
                        <span className="branch-tag tag-dev">dev branch</span>
                      </div>
                      <h4 className="branch-title">Dev Integration</h4>
                      <p className="branch-body">
                        Fast integration. Direct pushes or merges into dev automatically trigger build tests and deploy instantly to the development site.
                      </p>
                      <a href="https://rapcicd-dev.web.app" target="_blank" rel="noreferrer" className="branch-link">
                        dev.rapcicd.web.app
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3"/></svg>
                      </a>
                    </article>

                    {/* Staging environment */}
                    <article 
                      className={`branch-node ${activeNode === 'staging' ? 'active' : ''}`}
                      onMouseEnter={() => setActiveNode('staging')}
                      onMouseLeave={() => setActiveNode(null)}
                      onClick={() => setActiveNode(activeNode === 'staging' ? null : 'staging')}
                    >
                      <div className="branch-header">
                        <span className="branch-tag tag-staging">staging branch</span>
                      </div>
                      <h4 className="branch-title">Staging QA</h4>
                      <p className="branch-body">
                        The release candidate. Code is merged here for final QA or client review, deploying automatically to the staging site.
                      </p>
                      <a href="https://rapcicd-staging.web.app" target="_blank" rel="noreferrer" className="branch-link">
                        staging.rapcicd.web.app
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3"/></svg>
                      </a>
                    </article>

                    {/* Production environment */}
                    <article 
                      className={`branch-node ${activeNode === 'production' ? 'active' : ''}`}
                      onMouseEnter={() => setActiveNode('production')}
                      onMouseLeave={() => setActiveNode(null)}
                      onClick={() => setActiveNode(activeNode === 'production' ? null : 'production')}
                    >
                      <div className="branch-header">
                        <span className="branch-tag tag-prod">main branch</span>
                      </div>
                      <h4 className="branch-title">Production Live</h4>
                      <p className="branch-body">
                        Merges to main trigger release-please to bump package version, publish the CHANGELOG.md, and auto-deploy to the live production site.
                      </p>
                      <a href="https://rapcicd-ac398.web.app" target="_blank" rel="noreferrer" className="branch-link">
                        rapcicd.web.app
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3"/></svg>
                      </a>
                    </article>

                  </div>

                </div>
              </div>
            </div>
          </section>

          {/* ── Environment Simulator ── */}
          <section className="simulator-section" aria-label="Environment Simulator">
            <div className="simulator-heading">
              <h2>
                Interactive <span className="gradient-text">Workflow Simulator</span>
              </h2>
              <p>
                Select an environment to see the branch promotions, specifications, and simulated GitHub Actions CI/CD runner console outputs.
              </p>
            </div>

            <div className="simulator-tabs">
              <button 
                className={`simulator-tab ${selectedEnv === 'dev' ? 'active-dev' : ''}`}
                onClick={() => setSelectedEnv('dev')}
              >
                Development (dev)
              </button>
              <button 
                className={`simulator-tab ${selectedEnv === 'staging' ? 'active-staging' : ''}`}
                onClick={() => setSelectedEnv('staging')}
              >
                Staging (staging)
              </button>
              <button 
                className={`simulator-tab ${selectedEnv === 'main' ? 'active-main' : ''}`}
                onClick={() => setSelectedEnv('main')}
              >
                Production (main)
              </button>
            </div>

            <div className="simulator-grid">
              
              <div className="simulator-info">
                <span className={`sim-env-badge ${
                  selectedEnv === 'dev' ? 'tag-dev' : selectedEnv === 'staging' ? 'tag-staging' : 'tag-prod'
                }`}>
                  {selectedEnv} environment
                </span>
                <h3 className="sim-title">
                  {selectedEnv === 'dev' ? 'Continuous Integration & Dev Deploy' :
                   selectedEnv === 'staging' ? 'Release Candidate & QA Audit' :
                   'Version Releases & Live Deployment'}
                </h3>
                <p className="sim-desc">
                  {selectedEnv === 'dev' ? 
                    'Every commit pushed directly to dev or merged from feature branches runs tests instantly and deploys to dev. This allows developers to see their merged changes live together in a shared cloud sandbox.' :
                   selectedEnv === 'staging' ? 
                    'A strict reflection of production. Code is merged here from dev once basic functionality is approved. Deploys to staging so stakeholders, designers, and testers can review the release candidate in UAT.' :
                    'The production gate. Deploys directly to real users. Merges here require a Pull Request, all CI checks to pass, and approval. Google release-please runs here to manage versioning and write release notes.'
                  }
                </p>

                <div className="sim-specs">
                  <div className="spec-item">
                    <h5>Trigger Rule</h5>
                    <p>{selectedEnv === 'main' ? 'PR Merge to main' : `Push to ${selectedEnv}`}</p>
                  </div>
                  <div className="spec-item">
                    <h5>Firebase Site</h5>
                    <p>{selectedEnv === 'main' ? 'rapcicd-ac398' : `rapcicd-${selectedEnv}`}</p>
                  </div>
                  <div className="spec-item">
                    <h5>Hosting Target</h5>
                    <p>{selectedEnv === 'main' ? 'production (live)' : selectedEnv}</p>
                  </div>
                  <div className="spec-item">
                    <h5>Changelog Bumping</h5>
                    <p>{selectedEnv === 'main' ? 'Automatic (release-please)' : 'None (Changelog Seeded)'}</p>
                  </div>
                </div>
              </div>

              <div className="terminal-window">
                <div className="terminal-header">
                  <div className="terminal-dots">
                    <span className="dot dot-red" />
                    <span className="dot dot-yellow" />
                    <span className="dot dot-green" />
                  </div>
                  <div className="terminal-title">bash - GitHub Actions Runner</div>
                  <div style={{ width: 42 }} />
                </div>
                <div className="terminal-body">
                  {selectedEnv === 'dev' && (
                    <>
                      <span className="term-muted"># Triggered by push on dev branch</span>{"\n"}
                      <span className="term-cmd">$ git checkout dev</span>{"\n"}
                      Switched to branch &apos;dev&apos;{"\n"}
                      {"\n"}
                      <span className="term-cmd">$ npm run test:ci</span>{"\n"}
                      <span className="term-success">PASS</span> src/__tests__/page.test.tsx{"\n"}
                      {"\n"}
                      <span className="term-cmd">$ next build</span>{"\n"}
                      ✓ Compiled successfully{"\n"}
                      ✓ Generating static pages (5/5){"\n"}
                      {"\n"}
                      <span className="term-cmd">$ firebase deploy --only hosting:dev</span>{"\n"}
                      <span className="term-info">=== Deploying to &apos;rapcicd-ac398&apos;...</span>{"\n"}
                      i  hosting[dev]: beginning deploy for site rapcicd-dev{"\n"}
                      ✔  hosting[dev]: upload complete{"\n"}
                      <span className="term-success">✔  Deploy complete!</span>{"\n"}
                      {"\n"}
                      <span className="term-info">Dev URL: </span>
                      <a href="https://rapcicd-dev.web.app" target="_blank" rel="noreferrer" style={{ color: 'var(--accent-cyan-light)', textDecoration: 'underline' }}>
                        https://rapcicd-dev.web.app
                      </a>
                    </>
                  )}
                  {selectedEnv === 'staging' && (
                    <>
                      <span className="term-muted"># Triggered by push on staging branch</span>{"\n"}
                      <span className="term-cmd">$ git checkout staging</span>{"\n"}
                      Switched to branch &apos;staging&apos;{"\n"}
                      <span className="term-cmd">$ git merge dev</span>{"\n"}
                      Updating staging to match dev...{"\n"}
                      {"\n"}
                      <span className="term-cmd">$ npm run test:ci</span>{"\n"}
                      <span className="term-success">PASS</span> src/__tests__/page.test.tsx{"\n"}
                      {"\n"}
                      <span className="term-cmd">$ next build</span>{"\n"}
                      ✓ Compiled successfully{"\n"}
                      ✓ Generating static pages (5/5){"\n"}
                      {"\n"}
                      <span className="term-cmd">$ firebase deploy --only hosting:staging</span>{"\n"}
                      <span className="term-info">=== Deploying to &apos;rapcicd-ac398&apos;...</span>{"\n"}
                      i  hosting[staging]: beginning deploy for site rapcicd-staging{"\n"}
                      ✔  hosting[staging]: upload complete{"\n"}
                      <span className="term-success">✔  Deploy complete!</span>{"\n"}
                      {"\n"}
                      <span className="term-info">Staging URL: </span>
                      <a href="https://rapcicd-staging.web.app" target="_blank" rel="noreferrer" style={{ color: '#fbbf24', textDecoration: 'underline' }}>
                        https://rapcicd-staging.web.app
                      </a>{"\n"}
                      <span className="term-muted">[Awaiting UAT / Manual Approval to merge staging ➡️ main]</span>
                    </>
                  )}
                  {selectedEnv === 'main' && (
                    <>
                      <span className="term-muted"># Triggered by PR merge to main</span>{"\n"}
                      <span className="term-cmd">$ git checkout main</span>{"\n"}
                      Switched to branch &apos;main&apos;{"\n"}
                      {"\n"}
                      <span className="term-cmd"># Running googleapis/release-please-action...</span>{"\n"}
                      <span className="term-info">✔ version bumped: 0.1.0 ➡️ 0.2.0</span>{"\n"}
                      <span className="term-info">✔ CHANGELOG.md updated</span>{"\n"}
                      <span className="term-success">✔ Release v0.2.0 published on GitHub</span>{"\n"}
                      {"\n"}
                      <span className="term-cmd">$ firebase deploy --only hosting:production --channel live</span>{"\n"}
                      <span className="term-info">=== Deploying to &apos;rapcicd-ac398&apos;...</span>{"\n"}
                      i  hosting[production]: deploying to site rapcicd-ac398 (live channel){"\n"}
                      ✔  hosting[production]: upload complete{"\n"}
                      <span className="term-success">✔  Deploy complete!</span>{"\n"}
                      {"\n"}
                      <span className="term-info">Production Live URL: </span>
                      <a href="https://rapcicd-ac398.web.app" target="_blank" rel="noreferrer" style={{ color: '#34d399', textDecoration: 'underline' }}>
                        https://rapcicd-ac398.web.app
                      </a>
                    </>
                  )}
                </div>
              </div>

            </div>
          </section>
        </main>

        {/* ── Footer ── */}
        <footer className="footer">
          <p className="footer-left">
            Built with <span>rapcicd</span> · Next.js + Firebase Hosting
          </p>
          <nav className="footer-right" aria-label="Footer links">
            <a
              id="footer-github"
              href="https://github.com/rfxfxfx/rapcicd"
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub
            </a>
          </nav>
        </footer>
      </div>
    </div>
  )
}
