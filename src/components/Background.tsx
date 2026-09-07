import React, { useEffect, useRef, useState } from 'react';
import {
  Renderer,
  Camera,
  Transform,
  Program,
  Mesh,
  Geometry,
  Color,
  Vec3,
  Plane,
  Cylinder,
  Torus,
  Box,
  Sphere
} from 'ogl';

// ─── GLSL Shaders ───

// 1. Abstract 3D Procedural Topographic Grid / Wave Terrain Shader (Standard WebGL Compatible)
const terrainVertexShader = `
attribute vec3 position;
attribute vec2 uv;
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform float uTime;
uniform float uScrollProgress;

varying vec2 vUv;
varying float vElevation;
varying vec3 vViewPos;

void main() {
    vUv = uv;
    vec3 pos = position;

    // Procedural 3D abstract waves (Blender-like displacement landscape)
    float wave1 = sin(pos.x * 0.42 + uTime * 0.35) * cos(pos.y * 0.48 + uTime * 0.28) * 0.58;
    float wave2 = sin(pos.x * 0.85 - uTime * 0.22 + uScrollProgress * 3.5) * 0.22;
    float wave3 = cos((pos.x + pos.y) * 0.65 + uTime * 0.3) * 0.16;
    pos.z += wave1 + wave2 + wave3;

    vElevation = pos.z;
    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    vViewPos = mvPosition.xyz;
    gl_Position = projectionMatrix * mvPosition;
}
`;

const terrainFragmentShader = `
precision highp float;
uniform vec3 uColorBase;
uniform vec3 uColorGrid;
uniform float uOpacity;

varying vec2 vUv;
varying float vElevation;
varying vec3 vViewPos;

void main() {
    // Technical blueprint contour grid lines (standard WebGL compatible without extensions)
    vec2 majorCoord = abs(fract(vUv * vec2(32.0, 24.0) - 0.5) - 0.5);
    float majorDist = min(majorCoord.x, majorCoord.y);
    float majorLine = smoothstep(0.045, 0.008, majorDist);

    vec2 minorCoord = abs(fract(vUv * vec2(96.0, 72.0) - 0.5) - 0.5);
    float minorDist = min(minorCoord.x, minorCoord.y);
    float minorLine = smoothstep(0.025, 0.005, minorDist) * 0.35;

    float gridMask = max(majorLine, minorLine);

    // Subtle atmospheric distance falloff
    float depthFade = clamp((16.0 - (-vViewPos.z)) / 9.5, 0.25, 1.0);

    // Dynamic crest glow on wave peaks
    float crestGlow = smoothstep(-0.25, 0.65, vElevation) * 0.45;

    vec3 finalColor = mix(uColorBase, uColorGrid, gridMask * 0.85 + crestGlow * 0.5);
    float alpha = (gridMask * 0.48 + crestGlow * 0.25 + 0.07) * depthFade * uOpacity;

    gl_FragColor = vec4(finalColor, alpha);
}
`;

// 2. Physical Shading for Revealed 3D Portfolio Symbols (Faceted / Metallic Blender-style)
const symbolVertexShader = `
attribute vec3 position;
attribute vec3 normal;
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform mat3 normalMatrix;

varying vec3 vNormal;
varying vec3 vPosition;

void main() {
    vNormal = normalize(normalMatrix * normal);
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    vPosition = mvPosition.xyz;
    gl_Position = projectionMatrix * mvPosition;
}
`;

const symbolFragmentShader = `
precision highp float;
uniform vec3 uColorBase;
uniform vec3 uColorRim;
uniform vec3 uLightDir;
uniform float uOpacity;

varying vec3 vNormal;
varying vec3 vPosition;

void main() {
    vec3 normal = normalize(vNormal);
    vec3 viewDir = normalize(-vPosition);
    vec3 lightDir = normalize(uLightDir);

    // Key light (diffuse)
    float NdotL = max(dot(normal, lightDir), 0.0);
    float diffuse = NdotL * 0.65 + 0.35;

    // Fill light from lower-opposite angle
    vec3 fillDir = normalize(vec3(-0.7, -0.4, 0.8));
    float fillDiff = max(dot(normal, fillDir), 0.0) * 0.25;

    // Specular highlight (Blender glossy reflection)
    vec3 halfDir = normalize(lightDir + viewDir);
    float spec = pow(max(dot(normal, halfDir), 0.0), 28.0) * 0.75;

    // Fresnel rim glow
    float fresnel = pow(1.0 - max(dot(normal, viewDir), 0.0), 2.2);

    vec3 col = mix(uColorBase, uColorRim, fresnel * 0.75);
    vec3 finalCol = col * (diffuse + fillDiff) + vec3(1.0) * spec * 0.7 + uColorRim * fresnel * 0.8;
    float alpha = uOpacity * (0.88 + fresnel * 0.12);

    gl_FragColor = vec4(finalCol, alpha);
}
`;

// 3. Glowing Wireframe Outline Shader for 3D Symbols
const wireVertexShader = `
attribute vec3 position;
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;

void main() {
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const wireFragmentShader = `
precision highp float;
uniform vec3 uColorWire;
uniform float uOpacity;

void main() {
    gl_FragColor = vec4(uColorWire, uOpacity * 0.95);
}
`;

// 4. Glowing Node Beacons (Router Ports & Signal Indicators)
const beaconVertexShader = `
attribute vec3 position;
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform float uPixelRatio;

void main() {
    vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = (26.0 / max(-mvPos.z, 1.0)) * uPixelRatio;
    gl_Position = projectionMatrix * mvPos;
}
`;

const beaconFragmentShader = `
precision highp float;
uniform vec3 uColorBeacon;
uniform float uTime;
uniform float uOpacity;

void main() {
    vec2 coord = gl_PointCoord - vec2(0.5);
    float dist = length(coord);
    if (dist > 0.5) discard;
    float alpha = smoothstep(0.5, 0.05, dist);
    float pulse = 0.7 + 0.3 * sin(uTime * 4.0);
    gl_FragColor = vec4(uColorBeacon, alpha * pulse * uOpacity);
}
`;

// ─── Procedural Symbol Geometry Generators ───

// A) 3D Code Glyph `</>` Geometry (Frontend & Software Engineering)
function createCodeGlyphGeometry(gl: any) {
  const lines = [
    // `<` bracket
    [-0.75, 0.4, 0], [-1.15, 0.0, 0],
    [-1.15, 0.0, 0], [-0.75, -0.4, 0],

    // `/` slash
    [-0.22, -0.6, 0], [0.22, 0.6, 0],

    // `>` bracket
    [0.75, 0.4, 0], [1.15, 0.0, 0],
    [1.15, 0.0, 0], [0.75, -0.4, 0]
  ];

  const positions = new Float32Array(lines.flat());
  return new Geometry(gl, { position: { size: 3, data: positions } });
}

// B) 3D Security Shield Geometry (Cybersecurity & Credentials)
function createShieldGeometry(gl: any) {
  const shieldEdges = [
    [-0.65, 0.75, 0], [0.65, 0.75, 0],
    [0.65, 0.75, 0], [0.72, 0.15, 0],
    [0.72, 0.15, 0], [0.0, -0.85, 0],
    [0.0, -0.85, 0], [-0.72, 0.15, 0],
    [-0.72, 0.15, 0], [-0.65, 0.75, 0],

    [0.0, 0.75, 0.15], [0.0, -0.85, 0.15],
    [-0.65, 0.75, 0], [0.0, 0.75, 0.15],
    [0.65, 0.75, 0], [0.0, 0.75, 0.15],
    [0.72, 0.15, 0], [0.0, -0.15, 0.15],
    [-0.72, 0.15, 0], [0.0, -0.15, 0.15]
  ];

  const positions = new Float32Array(shieldEdges.flat());
  return new Geometry(gl, { position: { size: 3, data: positions } });
}

// Section Progress Detector: Computes real-time presence (0 to 1) of any section in viewport
function getSectionState(id: string): { progress: number; yRel: number } {
  if (typeof document === 'undefined') return { progress: 0, yRel: 0 };
  const el = document.getElementById(id);
  if (!el) return { progress: 0, yRel: 0 };

  const rect = el.getBoundingClientRect();
  const vh = window.innerHeight;

  // Center of section vs center of viewport
  const sectionCenter = rect.top + rect.height * 0.5;
  const viewportCenter = vh * 0.5;
  const dist = sectionCenter - viewportCenter;

  // Active range: section activates as it enters toward viewport center
  const activeHalfRange = Math.max(vh * 0.7, rect.height * 0.55);

  if (Math.abs(dist) > activeHalfRange) {
    return { progress: 0, yRel: dist > 0 ? 1 : -1 };
  }

  const factor = 1 - Math.abs(dist) / activeHalfRange;
  const smooth = factor * factor * (3 - 2 * factor); // smoothstep bell curve

  return { progress: smooth, yRel: dist / activeHalfRange };
}

export default function Background() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const gridRef = useRef<HTMLDivElement | null>(null);
  const [mounted, setMounted] = useState(false);
  const [isLowTier, setIsLowTier] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    setMounted(true);

    const checkTier = () => {
      setIsLowTier(document.documentElement.dataset.tier === 'low');
    };
    checkTier();
    window.addEventListener('tier-change', checkTier);

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setReducedMotion(true);
    }

    return () => {
      window.removeEventListener('tier-change', checkTier);
    };
  }, []);

  useEffect(() => {
    if (!mounted || isLowTier || !containerRef.current) return;

    const container = containerRef.current;
    let animationFrameId: number;
    let isDisposed = false;

    // ─── 1. OGL Renderer Setup ───
    const renderer = new Renderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
      dpr: Math.min(window.devicePixelRatio || 1, 2)
    });

    const gl = renderer.gl;
    gl.clearColor(0, 0, 0, 0);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    container.appendChild(gl.canvas);
    gl.canvas.style.position = 'absolute';
    gl.canvas.style.inset = '0';
    gl.canvas.style.width = '100%';
    gl.canvas.style.height = '100%';
    gl.canvas.style.pointerEvents = 'none';

    // ─── 2. Camera & Scene Hierarchy ───
    const camera = new Camera(gl, { fov: 44 });
    camera.position.set(0, 0, 7.5);

    const scene = new Transform();

    // ─── 3. Shaders & Material Programs ───
    const terrainProgram = new Program(gl, {
      vertex: terrainVertexShader,
      fragment: terrainFragmentShader,
      transparent: true,
      cullFace: null,
      depthTest: true,
      depthWrite: false,
      uniforms: {
        uColorBase: { value: new Color(0.04, 0.1, 0.22) },
        uColorGrid: { value: new Color(0.24, 0.58, 0.98) },
        uOpacity: { value: 0.72 },
        uTime: { value: 0 },
        uScrollProgress: { value: 0 }
      }
    });

    // Program factories for independent smooth transitions
    const makeSymbolProgram = () =>
      new Program(gl, {
        vertex: symbolVertexShader,
        fragment: symbolFragmentShader,
        transparent: true,
        cullFace: null,
        depthTest: true,
        depthWrite: false,
        uniforms: {
          uColorBase: { value: new Color(0.06, 0.12, 0.28) },
          uColorRim: { value: new Color(0.23, 0.51, 0.96) },
          uLightDir: { value: new Vec3(0.8, 1.2, 1.5).normalize() },
          uOpacity: { value: 0.0 }
        }
      });

    const makeWireProgram = () =>
      new Program(gl, {
        vertex: wireVertexShader,
        fragment: wireFragmentShader,
        transparent: true,
        depthTest: true,
        depthWrite: false,
        uniforms: {
          uColorWire: { value: new Color(0.35, 0.78, 1.0) },
          uOpacity: { value: 0.0 }
        }
      });

    const makeBeaconProgram = () =>
      new Program(gl, {
        vertex: beaconVertexShader,
        fragment: beaconFragmentShader,
        transparent: true,
        depthTest: false,
        uniforms: {
          uColorBeacon: { value: new Color(0.42, 0.88, 1.0) },
          uTime: { value: 0 },
          uOpacity: { value: 0.0 },
          uPixelRatio: { value: renderer.dpr }
        }
      });

    // Programs for each section's 3D object
    const aboutSymbolProg = makeSymbolProgram();
    const aboutWireProg = makeWireProgram();

    const projectsSymbolProg = makeSymbolProgram();
    const projectsWireProg = makeWireProgram();

    const skillsSymbolProg = makeSymbolProgram();
    const skillsWireProg = makeWireProgram();
    const skillsBeaconProg = makeBeaconProgram();

    const certSymbolProg = makeSymbolProgram();
    const certWireProg = makeWireProgram();

    const testSymbolProg = makeSymbolProgram();
    const testWireProg = makeWireProgram();

    const contactSymbolProg = makeSymbolProgram();
    const contactWireProg = makeWireProgram();
    const contactBeaconProg = makeBeaconProgram();

    const allSymbolProgs = [aboutSymbolProg, projectsSymbolProg, skillsSymbolProg, certSymbolProg, testSymbolProg, contactSymbolProg];
    const allWireProgs = [aboutWireProg, projectsWireProg, skillsWireProg, certWireProg, testWireProg, contactWireProg];
    const allBeaconProgs = [skillsBeaconProg, contactBeaconProg];

    // ─── 4. BASE LAYER: Abstract Procedural 3D Topographic Mesh ───
    // At Hero, this abstract landscape is the sole focal background, calm & architectural
    const terrainGeom = new Plane(gl, {
      width: 18,
      height: 14,
      widthSegments: 38,
      heightSegments: 28
    });

    const terrainMesh = new Mesh(gl, { geometry: terrainGeom, program: terrainProgram });
    terrainMesh.rotation.set(-1.05, 0.08, -0.15);
    terrainMesh.position.set(0.0, -1.3, -1.2);
    terrainMesh.setParent(scene);

    // ─── 5. SECTION-BASED 3D OBJECTS (Appear when respective section is in view) ───

    // ─────────────────────────────────────────────────────────────
    // OBJECT 1: About & Background (`#about`) -> 3D Developer Code Monolith
    // ─────────────────────────────────────────────────────────────
    const aboutGroup = new Transform();
    aboutGroup.setParent(scene);
    aboutGroup.visible = false;

    // Solid beveled terminal monolith
    const monolithGeom = new Box(gl, { width: 1.4, height: 1.8, depth: 0.22 });
    const monolithMesh = new Mesh(gl, { geometry: monolithGeom, program: aboutSymbolProg });
    monolithMesh.setParent(aboutGroup);

    // Embossed 3D glowing `< / >` code symbol
    const codeGlyphGeom = createCodeGlyphGeometry(gl);
    const codeGlyphMesh = new Mesh(gl, { mode: gl.LINES, geometry: codeGlyphGeom, program: aboutWireProg });
    codeGlyphMesh.position.set(0, 0, 0.13);
    codeGlyphMesh.setParent(aboutGroup);

    // Orbiting syntax gems
    const syntaxGemGeom = new Box(gl, { width: 0.22, height: 0.22, depth: 0.22 });
    const gem1 = new Mesh(gl, { geometry: syntaxGemGeom, program: aboutSymbolProg });
    gem1.rotation.set(Math.PI / 4, Math.PI / 4, 0);
    gem1.setParent(aboutGroup);

    const gem2 = new Mesh(gl, { geometry: syntaxGemGeom, program: aboutSymbolProg });
    gem2.rotation.set(-Math.PI / 4, Math.PI / 4, 0);
    gem2.setParent(aboutGroup);

    // Outer gimbal orbit ring
    const codeRingGeom = new Torus(gl, { radius: 1.45, tube: 0.014, radialSegments: 36, tubularSegments: 8 });
    const codeRingMesh = new Mesh(gl, { geometry: codeRingGeom, program: aboutWireProg });
    codeRingMesh.rotation.set(0.45, 0.2, 0);
    codeRingMesh.setParent(aboutGroup);

    // ─────────────────────────────────────────────────────────────
    // OBJECT 2: Featured Projects (`#projects`) -> 3D Database Server Architecture Stack
    // ─────────────────────────────────────────────────────────────
    const projectsGroup = new Transform();
    projectsGroup.setParent(scene);
    projectsGroup.visible = false;

    const discGeom = new Cylinder(gl, { radiusTop: 0.62, radiusBottom: 0.62, height: 0.22, radialSegments: 28 });
    const discRingGeom = new Torus(gl, { radius: 0.63, tube: 0.016, radialSegments: 28, tubularSegments: 8 });

    [-0.32, 0.0, 0.32].forEach((offsetY) => {
      const disc = new Mesh(gl, { geometry: discGeom, program: projectsSymbolProg });
      disc.position.set(0, offsetY, 0);
      disc.setParent(projectsGroup);

      const discRing = new Mesh(gl, { geometry: discRingGeom, program: projectsWireProg });
      discRing.position.set(0, offsetY, 0);
      discRing.rotation.set(Math.PI / 2, 0, 0);
      discRing.setParent(projectsGroup);
    });

    // Orbiting query cache data blocks
    const queryBlockGeom = new Box(gl, { width: 0.22, height: 0.22, depth: 0.22 });
    const queryBlock1 = new Mesh(gl, { geometry: queryBlockGeom, program: projectsSymbolProg });
    queryBlock1.setParent(projectsGroup);
    const queryBlock2 = new Mesh(gl, { geometry: queryBlockGeom, program: projectsSymbolProg });
    queryBlock2.setParent(projectsGroup);

    // Orbital data ring
    const dbOrbitRing = new Torus(gl, { radius: 1.25, tube: 0.012, radialSegments: 36, tubularSegments: 8 });
    const dbOrbitMesh = new Mesh(gl, { geometry: dbOrbitRing, program: projectsWireProg });
    dbOrbitMesh.rotation.set(0.65, 0.35, 0);
    dbOrbitMesh.setParent(projectsGroup);

    // ─────────────────────────────────────────────────────────────
    // OBJECT 3: Technologies & Tools (`#skills`) -> 3D Cisco Network Router & Packet Satellite
    // ─────────────────────────────────────────────────────────────
    const skillsGroup = new Transform();
    skillsGroup.setParent(scene);
    skillsGroup.visible = false;

    const ciscoHubGeom = new Cylinder(gl, { radiusTop: 0.42, radiusBottom: 0.42, height: 0.26, radialSegments: 24 });
    const ciscoHub = new Mesh(gl, { geometry: ciscoHubGeom, program: skillsSymbolProg });
    ciscoHub.setParent(skillsGroup);

    // Cross bus network trunks
    const trunkGeom = new Cylinder(gl, { radiusTop: 0.022, radiusBottom: 0.022, height: 1.3, radialSegments: 8 });
    const trunkH = new Mesh(gl, { geometry: trunkGeom, program: skillsWireProg });
    trunkH.rotation.set(0, 0, Math.PI / 2);
    trunkH.setParent(skillsGroup);

    const trunkV = new Mesh(gl, { geometry: trunkGeom, program: skillsWireProg });
    trunkV.setParent(skillsGroup);

    // Equatorial protocol ring
    const ciscoRingGeom = new Torus(gl, { radius: 0.78, tube: 0.014, radialSegments: 32, tubularSegments: 8 });
    const ciscoRing = new Mesh(gl, { geometry: ciscoRingGeom, program: skillsWireProg });
    ciscoRing.rotation.set(Math.PI / 2, 0, 0);
    ciscoRing.setParent(skillsGroup);

    // 4 LED Beacon Ports
    const ciscoPortPositions = new Float32Array([
      0.65, 0, 0,
      -0.65, 0, 0,
      0, 0.65, 0,
      0, -0.65, 0
    ]);
    const ciscoPortsGeom = new Geometry(gl, { position: { size: 3, data: ciscoPortPositions } });
    const ciscoPortsMesh = new Mesh(gl, { mode: gl.POINTS, geometry: ciscoPortsGeom, program: skillsBeaconProg });
    ciscoPortsMesh.setParent(skillsGroup);

    // Orbiting packet spheres
    const packetGeom = new Sphere(gl, { radius: 0.1, widthSegments: 14, heightSegments: 10 });
    const packet1 = new Mesh(gl, { geometry: packetGeom, program: skillsSymbolProg });
    packet1.setParent(skillsGroup);
    const packet2 = new Mesh(gl, { geometry: packetGeom, program: skillsSymbolProg });
    packet2.setParent(skillsGroup);

    // ─────────────────────────────────────────────────────────────
    // OBJECT 4: Certifications & Credentials (`#certifications`) -> 3D Cybersecurity Shield & Crest
    // ─────────────────────────────────────────────────────────────
    const certGroup = new Transform();
    certGroup.setParent(scene);
    certGroup.visible = false;

    // Solid shield body
    const shieldPlateGeom = new Box(gl, { width: 1.15, height: 1.45, depth: 0.16 });
    const shieldPlate = new Mesh(gl, { geometry: shieldPlateGeom, program: certSymbolProg });
    shieldPlate.setParent(certGroup);

    // Beveled shield wireframe contour
    const shieldGeom = createShieldGeometry(gl);
    const shieldMesh = new Mesh(gl, { mode: gl.LINES, geometry: shieldGeom, program: certWireProg });
    shieldMesh.position.set(0, 0, 0.1);
    shieldMesh.setParent(certGroup);

    // Central diamond security lock / verified core
    const lockGeom = new Box(gl, { width: 0.42, height: 0.42, depth: 0.32 });
    const lockMesh = new Mesh(gl, { geometry: lockGeom, program: certSymbolProg });
    lockMesh.position.set(0, 0, 0.15);
    lockMesh.rotation.set(0, 0, Math.PI / 4);
    lockMesh.setParent(certGroup);

    // Outer verification ring
    const certRingGeom = new Torus(gl, { radius: 1.25, tube: 0.014, radialSegments: 36, tubularSegments: 8 });
    const certRing = new Mesh(gl, { geometry: certRingGeom, program: certWireProg });
    certRing.rotation.set(0.35, 0.2, 0);
    certRing.setParent(certGroup);

    // ─────────────────────────────────────────────────────────────
    // OBJECT 5: Testimonials (`#testimonials`) -> 3D Trust Endorsement Crystal
    // ─────────────────────────────────────────────────────────────
    const testGroup = new Transform();
    testGroup.setParent(scene);
    testGroup.visible = false;

    // Faceted diamond bipyramid crystal
    const crystalGeom = new Sphere(gl, { radius: 0.58, widthSegments: 6, heightSegments: 4 });
    const crystalMesh = new Mesh(gl, { geometry: crystalGeom, program: testSymbolProg });
    crystalMesh.setParent(testGroup);

    // Wireframe facet lines
    const crystalWireMesh = new Mesh(gl, { mode: gl.LINES, geometry: crystalGeom, program: testWireProg });
    crystalWireMesh.setParent(testGroup);

    // Dual interlocking gyroscope trust rings
    const gyroRing1Geom = new Torus(gl, { radius: 1.05, tube: 0.014, radialSegments: 32, tubularSegments: 8 });
    const gyroRing1 = new Mesh(gl, { geometry: gyroRing1Geom, program: testWireProg });
    gyroRing1.setParent(testGroup);

    const gyroRing2Geom = new Torus(gl, { radius: 1.25, tube: 0.014, radialSegments: 32, tubularSegments: 8 });
    const gyroRing2 = new Mesh(gl, { geometry: gyroRing2Geom, program: testWireProg });
    gyroRing2.rotation.set(Math.PI / 2, 0, 0);
    gyroRing2.setParent(testGroup);

    // ─────────────────────────────────────────────────────────────
    // OBJECT 6: Contact & Connect (`#contact`) -> 3D Holographic Communication Satellite
    // ─────────────────────────────────────────────────────────────
    const contactGroup = new Transform();
    contactGroup.setParent(scene);
    contactGroup.visible = false;

    // Transmitter sphere
    const commSphereGeom = new Sphere(gl, { radius: 0.45, widthSegments: 20, heightSegments: 14 });
    const commSphere = new Mesh(gl, { geometry: commSphereGeom, program: contactSymbolProg });
    commSphere.setParent(contactGroup);

    // Parabolic receiver dish
    const dishGeom = new Cylinder(gl, { radiusTop: 0.65, radiusBottom: 0.15, height: 0.28, radialSegments: 24 });
    const dishMesh = new Mesh(gl, { geometry: dishGeom, program: contactSymbolProg });
    dishMesh.rotation.set(Math.PI / 2, 0, 0);
    dishMesh.position.set(0, 0, -0.2);
    dishMesh.setParent(contactGroup);

    // Antenna spike
    const spikeGeom = new Cylinder(gl, { radiusTop: 0.012, radiusBottom: 0.02, height: 0.9, radialSegments: 8 });
    const spikeMesh = new Mesh(gl, { geometry: spikeGeom, program: contactWireProg });
    spikeMesh.position.set(0, 0.55, 0);
    spikeMesh.setParent(contactGroup);

    // Pulsing antenna beacon at tip of spike
    const beaconPointPositions = new Float32Array([0, 1.0, 0]);
    const beaconPointGeom = new Geometry(gl, { position: { size: 3, data: beaconPointPositions } });
    const beaconPointMesh = new Mesh(gl, { mode: gl.POINTS, geometry: beaconPointGeom, program: contactBeaconProg });
    beaconPointMesh.setParent(contactGroup);

    // Expanding holographic pulse wave ring
    const pulseRingGeom = new Torus(gl, { radius: 1.15, tube: 0.014, radialSegments: 36, tubularSegments: 8 });
    const pulseRingMesh = new Mesh(gl, { geometry: pulseRingGeom, program: contactWireProg });
    pulseRingMesh.rotation.set(Math.PI / 2, 0, 0);
    pulseRingMesh.setParent(contactGroup);

    // ─── 6. Dynamic Theme Color Adaptation (Dark & Light Mode) ───
    const applyThemeColors = () => {
      const isDark = document.documentElement.classList.contains('dark');
      if (isDark) {
        terrainProgram.uniforms.uColorBase.value.set(0.04, 0.09, 0.2);
        terrainProgram.uniforms.uColorGrid.value.set(0.24, 0.58, 0.98);
        terrainProgram.uniforms.uOpacity.value = 0.72;

        allSymbolProgs.forEach((prog) => {
          prog.uniforms.uColorBase.value.set(0.05, 0.12, 0.25);
          prog.uniforms.uColorRim.value.set(0.3, 0.72, 1.0);
        });

        allWireProgs.forEach((prog) => {
          prog.uniforms.uColorWire.value.set(0.4, 0.85, 1.0);
        });

        allBeaconProgs.forEach((prog) => {
          prog.uniforms.uColorBeacon.value.set(0.5, 0.95, 1.0);
        });
      } else {
        terrainProgram.uniforms.uColorBase.value.set(0.76, 0.85, 0.96);
        terrainProgram.uniforms.uColorGrid.value.set(0.18, 0.44, 0.92);
        terrainProgram.uniforms.uOpacity.value = 0.52;

        allSymbolProgs.forEach((prog) => {
          prog.uniforms.uColorBase.value.set(0.82, 0.9, 0.98);
          prog.uniforms.uColorRim.value.set(0.1, 0.45, 0.98);
        });

        allWireProgs.forEach((prog) => {
          prog.uniforms.uColorWire.value.set(0.08, 0.35, 0.92);
        });

        allBeaconProgs.forEach((prog) => {
          prog.uniforms.uColorBeacon.value.set(0.1, 0.5, 1.0);
        });
      }
    };

    applyThemeColors();

    const themeObserver = new MutationObserver((mutations) => {
      for (const m of mutations) {
        if (m.attributeName === 'class') {
          applyThemeColors();
        }
      }
    });
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

    // ─── 7. Viewport Resize ───
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      renderer.setSize(width, height);
      camera.perspective({ aspect: width / height });
      allBeaconProgs.forEach((prog) => {
        prog.uniforms.uPixelRatio.value = renderer.dpr;
      });
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    // ─── 8. Mouse Parallax Input ───
    let mouseTargetX = 0;
    let mouseTargetY = 0;
    let currentMouseX = 0;
    let currentMouseY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      if (window.innerWidth >= 768) {
        const halfW = window.innerWidth / 2;
        const halfH = window.innerHeight / 2;
        mouseTargetX = (e.clientX - halfW) / halfW;
        mouseTargetY = (e.clientY - halfH) / halfH;
      }
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    // ─── 9. Render & Parallax Loop ───
    let isVisible = true;

    const handleVisibility = () => {
      isVisible = document.visibilityState === 'visible';
    };
    document.addEventListener('visibilitychange', handleVisibility);

    const renderLoop = (now: number) => {
      if (isDisposed) return;
      animationFrameId = requestAnimationFrame(renderLoop);

      if (!isVisible) return;

      const tSec = now * 0.001;

      // Update shader time uniforms
      terrainProgram.uniforms.uTime.value = tSec;
      allBeaconProgs.forEach((prog) => {
        prog.uniforms.uTime.value = tSec;
      });

      // Scroll Tracking
      const currentScrollY = window.scrollY;
      const scrollMax = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      const scrollProgress = Math.min(Math.max(currentScrollY / scrollMax, 0), 1);

      terrainProgram.uniforms.uScrollProgress.value = scrollProgress;

      // Mouse Parallax Damping
      currentMouseX += (mouseTargetX - currentMouseX) * 0.05;
      currentMouseY += (mouseTargetY - currentMouseY) * 0.05;

      // Static Blueprint Dot Grid Parallax
      if (gridRef.current && !reducedMotion) {
        const gridParallaxY = -(currentScrollY * 0.12);
        gridRef.current.style.transform = `translate3d(0, ${gridParallaxY}px, 0)`;
      }

      // Abstract Terrain Parallax Motion (undulates and tilts smoothly)
      const targetTerrainY = -1.3 + (scrollProgress * 0.45) - currentMouseY * 0.15;
      const targetTerrainRotX = -1.05 + (scrollProgress * 0.25) - currentMouseY * 0.18;
      const targetTerrainRotY = 0.08 + currentMouseX * 0.22;

      terrainMesh.position.y += (targetTerrainY - terrainMesh.position.y) * 0.06;
      terrainMesh.rotation.x += (targetTerrainRotX - terrainMesh.rotation.x) * 0.06;
      terrainMesh.rotation.y += (targetTerrainRotY - terrainMesh.rotation.y) * 0.06;

      // ─── Responsive Positioning & Placement ───
      const width = window.innerWidth;
      const isWide = width >= 1440;
      const isMediumDesktop = width >= 1024 && width < 1440;
      const isTablet = width >= 768 && width < 1024;
      const isPortrait = width < 768;

      let baseX = 3.35;
      let baseY = 0.25;
      let baseZ = 0.35;
      let scaleMult = 1.3;

      if (isWide) {
        // Wide screen: sits in open right margin beside cards
        baseX = 3.45;
        baseY = 0.25;
        baseZ = 0.4;
        scaleMult = 1.35;
      } else if (isMediumDesktop) {
        // Medium desktop: positioned beside headers & cards
        baseX = 3.0;
        baseY = 0.35;
        baseZ = 0.3;
        scaleMult = 1.15;
      } else if (isTablet) {
        baseX = 2.4;
        baseY = 0.4;
        baseZ = 0.1;
        scaleMult = 0.95;
      } else {
        // Mobile / portrait: centered behind content cards with gentle ambient scale
        baseX = 0.0;
        baseY = 0.1;
        baseZ = -0.4;
        scaleMult = 0.78;
      }

      const opacityMult = isPortrait ? 0.35 : 0.95;

      // ─── REAL-TIME SECTION-BASED REVEAL LOGIC ───
      // Each section's 3D object only surfaces when that specific section is active in view.
      // At Hero (top of page), all objects are hidden, keeping the initial hero background static & calm.

      // 1. About Section -> Developer Code Monolith
      const aboutState = getSectionState('about');
      aboutGroup.visible = aboutState.progress > 0.01;
      const aboutOpacity = aboutState.progress * opacityMult;
      aboutSymbolProg.uniforms.uOpacity.value = aboutOpacity * 0.9;
      aboutWireProg.uniforms.uOpacity.value = aboutOpacity * 1.0;

      if (aboutGroup.visible) {
        const yOff = (1 - aboutState.progress) * -0.55;
        const curScale = aboutState.progress * scaleMult;
        aboutGroup.position.set(
          baseX + currentMouseX * 0.2,
          baseY + yOff - currentMouseY * 0.15,
          baseZ
        );
        aboutGroup.scale.set(curScale, curScale, curScale);
        aboutGroup.rotation.set(0.18 + Math.sin(tSec * 0.4) * 0.1, tSec * 0.35 + currentMouseX * 0.25, 0.08);

        // Orbiting syntax gems
        gem1.position.set(Math.cos(tSec * 1.4) * 1.1, Math.sin(tSec * 1.0) * 0.35, Math.sin(tSec * 1.4) * 0.7);
        gem2.position.set(-Math.cos(tSec * 1.4) * 1.1, -Math.sin(tSec * 1.0) * 0.35, -Math.sin(tSec * 1.4) * 0.7);
      }

      // 2. Featured Projects Section -> Database Server Architecture Stack
      const projectsState = getSectionState('projects');
      projectsGroup.visible = projectsState.progress > 0.01;
      const projectsOpacity = projectsState.progress * opacityMult;
      projectsSymbolProg.uniforms.uOpacity.value = projectsOpacity * 0.9;
      projectsWireProg.uniforms.uOpacity.value = projectsOpacity * 1.0;

      if (projectsGroup.visible) {
        const yOff = (1 - projectsState.progress) * -0.55;
        const curScale = projectsState.progress * scaleMult;
        projectsGroup.position.set(
          baseX + currentMouseX * 0.2,
          baseY + 0.05 + yOff - currentMouseY * 0.15,
          baseZ
        );
        projectsGroup.scale.set(curScale, curScale, curScale);
        projectsGroup.rotation.set(0.32 + Math.sin(tSec * 0.35) * 0.1, tSec * 0.38 + currentMouseX * 0.25, -0.12);

        // Orbiting query cache data blocks
        queryBlock1.position.set(Math.cos(tSec * 1.5) * 1.15, 0.22 + Math.sin(tSec * 1.1) * 0.18, Math.sin(tSec * 1.5) * 1.15);
        queryBlock2.position.set(-Math.cos(tSec * 1.3) * 1.2, -0.18 + Math.cos(tSec * 0.8) * 0.15, -Math.sin(tSec * 1.3) * 1.2);
      }

      // 3. Skills Section -> Cisco Network Router & Packet Satellite
      const skillsState = getSectionState('skills');
      skillsGroup.visible = skillsState.progress > 0.01;
      const skillsOpacity = skillsState.progress * opacityMult;
      skillsSymbolProg.uniforms.uOpacity.value = skillsOpacity * 0.9;
      skillsWireProg.uniforms.uOpacity.value = skillsOpacity * 1.0;
      skillsBeaconProg.uniforms.uOpacity.value = skillsOpacity * 1.0;

      if (skillsGroup.visible) {
        const yOff = (1 - skillsState.progress) * -0.55;
        const curScale = skillsState.progress * scaleMult;
        skillsGroup.position.set(
          baseX + currentMouseX * 0.2,
          baseY - 0.05 + yOff - currentMouseY * 0.15,
          baseZ
        );
        skillsGroup.scale.set(curScale, curScale, curScale);
        skillsGroup.rotation.set(0.3 + Math.sin(tSec * 0.4) * 0.08, tSec * 0.38 + currentMouseX * 0.3, tSec * 0.18);

        // Orbiting packet spheres
        packet1.position.set(Math.cos(tSec * 1.8) * 0.78, Math.sin(tSec * 1.8) * 0.78, 0);
        packet2.position.set(Math.cos(tSec * 1.8 + Math.PI) * 0.78, Math.sin(tSec * 1.8 + Math.PI) * 0.78, 0);
      }

      // 4. Certifications Section -> Cybersecurity Shield & Crest
      const certState = getSectionState('certifications');
      certGroup.visible = certState.progress > 0.01;
      const certOpacity = certState.progress * opacityMult;
      certSymbolProg.uniforms.uOpacity.value = certOpacity * 0.9;
      certWireProg.uniforms.uOpacity.value = certOpacity * 1.0;

      if (certGroup.visible) {
        const yOff = (1 - certState.progress) * -0.55;
        const curScale = certState.progress * scaleMult;
        certGroup.position.set(
          baseX + currentMouseX * 0.2,
          baseY + yOff - currentMouseY * 0.15,
          baseZ
        );
        certGroup.scale.set(curScale, curScale, curScale);
        certGroup.rotation.set(0.2 + Math.sin(tSec * 0.35) * 0.1, tSec * 0.3 + currentMouseX * 0.25, 0.06);

        // Rotating central lock
        lockMesh.rotation.set(tSec * 0.6, tSec * 0.5, Math.PI / 4);
      }

      // 5. Testimonials Section -> Trust Endorsement Crystal
      const testState = getSectionState('testimonials');
      testGroup.visible = testState.progress > 0.01;
      const testOpacity = testState.progress * opacityMult;
      testSymbolProg.uniforms.uOpacity.value = testOpacity * 0.9;
      testWireProg.uniforms.uOpacity.value = testOpacity * 1.0;

      if (testGroup.visible) {
        const yOff = (1 - testState.progress) * -0.55;
        const curScale = testState.progress * scaleMult;
        testGroup.position.set(
          baseX + currentMouseX * 0.2,
          baseY + yOff - currentMouseY * 0.15,
          baseZ
        );
        testGroup.scale.set(curScale, curScale, curScale);
        testGroup.rotation.set(0.25 + Math.sin(tSec * 0.3) * 0.1, tSec * 0.32 + currentMouseX * 0.2, 0.1);

        // Dual counter-rotating gyroscope rings
        gyroRing1.rotation.set(tSec * 0.5, tSec * 0.7, 0);
        gyroRing2.rotation.set(-tSec * 0.6, 0, tSec * 0.5);
      }

      // 6. Contact Section -> Holographic Communication Satellite
      const contactState = getSectionState('contact');
      contactGroup.visible = contactState.progress > 0.01;
      const contactOpacity = contactState.progress * opacityMult;
      contactSymbolProg.uniforms.uOpacity.value = contactOpacity * 0.9;
      contactWireProg.uniforms.uOpacity.value = contactOpacity * 1.0;
      contactBeaconProg.uniforms.uOpacity.value = contactOpacity * 1.0;

      if (contactGroup.visible) {
        const yOff = (1 - contactState.progress) * -0.55;
        const curScale = contactState.progress * scaleMult;
        contactGroup.position.set(
          baseX + currentMouseX * 0.2,
          baseY + yOff - currentMouseY * 0.15,
          baseZ
        );
        contactGroup.scale.set(curScale, curScale, curScale);
        contactGroup.rotation.set(0.28 + Math.sin(tSec * 0.3) * 0.1, tSec * 0.34 + currentMouseX * 0.25, -0.1);

        // Pulse wave expansion
        const pulseCycle = (tSec * 0.8) % 1.0;
        const pulseScale = 0.8 + pulseCycle * 0.9;
        pulseRingMesh.scale.set(pulseScale, pulseScale, pulseScale);
      }

      // Render Scene with safe guard for frame teardown
      try {
        renderer.render({ scene, camera });
      } catch (err) {
        // Graceful handling of teardown
      }
    };

    animationFrameId = requestAnimationFrame(renderLoop);

    // ─── 10. Cleanup on Unmount ───
    return () => {
      isDisposed = true;
      cancelAnimationFrame(animationFrameId);
      themeObserver.disconnect();
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);

      try {
        if (gl.canvas && gl.canvas.parentElement) {
          gl.canvas.parentElement.removeChild(gl.canvas);
        }
        const loseContextExt = gl.getExtension('WEBGL_lose_context');
        if (loseContextExt) {
          loseContextExt.loseContext();
        }
      } catch (err) {
        // Safe context teardown
      }
    };
  }, [mounted, isLowTier, reducedMotion]);

  if (!mounted || isLowTier) return null;

  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden select-none" aria-hidden="true">
      {/* Layer 1: Dot Matrix Grid (Static blueprint background with smooth vertical parallax drift) */}
      <div
        ref={gridRef}
        className="absolute -top-48 -bottom-48 inset-x-0 bg-[radial-gradient(hsla(var(--foreground)/0.12)_1px,transparent_1px)] [background-size:24px_24px] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,#000_60%,transparent_100%)] opacity-35 will-change-transform"
      />

      {/* Layer 2: Abstract Topographic 3D Horizon with Section-Based Revealed Symbols */}
      <div ref={containerRef} className="absolute inset-0 w-full h-full" />
    </div>
  );
}
